<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Mail, KeyRound, Shield, RefreshCw, User as UserIcon } from 'lucide-vue-next'
import { useUserStore } from '@/stores/userStore'
import TwoFactorSetupDialog from './TwoFactorSetupDialog.vue'
import TwoFactorDisableDialog from './TwoFactorDisableDialog.vue'
import RegenerateBackupCodesDialog from './RegenerateBackupCodesDialog.vue'
import ResetPasswordDialog from './ResetPasswordDialog.vue'
import DeviceManagementDialog from './DeviceManagementDialog.vue'
import AvatarCropDialog from './AvatarCropDialog.vue'
import { get2FAStatus, getUserInfo } from '@/api/userApi'
import { getAvatar, buildAvatarUrl } from '@/api/profileApi'

const { t } = useI18n()
const userStore = useUserStore()

// User info
const userName = ref('')
const userEmail = ref('')
const userType = ref<number>(0)
const userAvatar = ref<string | null>(userStore.avatarUrl)
const isLoadingAvatar = ref(false)
const isLoadingUserInfo = ref(false)

// 2FA state
const is2FAEnabled = ref(false)
const backupCodesRemaining = ref(0)
const isLoading2FAStatus = ref(false)

// Dialogs state
const showResetPasswordDialog = ref(false)
const showDeviceManagementDialog = ref(false)
const show2FASetupDialog = ref(false)
const show2FADisableDialog = ref(false)
const showRegenerateCodesDialog = ref(false)
const showAvatarCropDialog = ref(false)

// Fetch all account data on mount
onMounted(async () => {
  await Promise.all([fetch2FAStatus(), fetchUserInfo(), fetchAvatar()])
})

async function fetchUserInfo() {
  isLoadingUserInfo.value = true
  try {
    const response = await getUserInfo()
    userName.value = response.data.name
    userEmail.value = response.data.email
    userType.value = response.data.user_type
  } catch (error) {
    console.error('Failed to fetch user info:', error)
    toast.error(t('settings.account.fetchUserInfoError'))
  } finally {
    isLoadingUserInfo.value = false
  }
}

/** Fetch the current avatar URL and sync it into the store */
async function fetchAvatar() {
  isLoadingAvatar.value = true
  try {
    const response = await getAvatar('256x256')
    const fullUrl = buildAvatarUrl(response.data.url)
    const cacheBustedUrl = fullUrl ? `${fullUrl}?t=${Date.now()}` : fullUrl
    userAvatar.value = cacheBustedUrl
    userStore.setAvatarUrl(cacheBustedUrl)
  } catch (error: any) {
    // 404 means user has no avatar — clear the local ref
    if (error?.response?.status === 404) {
      userAvatar.value = null
      userStore.setAvatarUrl(null)
    } else {
      console.error('Failed to fetch avatar:', error)
    }
  } finally {
    isLoadingAvatar.value = false
  }
}

/** Called after AvatarCropDialog reports a successful upload */
function handleAvatarSuccess(avatarUrls: { webp_256: string; webp_64: string }) {
  const fullUrl = buildAvatarUrl(avatarUrls.webp_256)
  // Append a cache-busting parameter so the browser fetches the new image
  // and Vue detects a changed URL string even when the path is identical.
  const cacheBustedUrl = fullUrl ? `${fullUrl}?t=${Date.now()}` : fullUrl
  userAvatar.value = cacheBustedUrl
  userStore.setAvatarUrl(cacheBustedUrl)
}

const userPlanDisplay = computed(() => {
  if (String(userType.value) === '1') {
    return t('settings.account.plans.free')
  }
  // Add more plan types as needed
  return String(userType.value)
})

async function fetch2FAStatus() {
  isLoading2FAStatus.value = true
  try {
    const response = await get2FAStatus()
    is2FAEnabled.value = response.data.is_2fa_enabled
    backupCodesRemaining.value = response.data.backup_codes_remaining
  } catch (error) {
    console.error('Failed to fetch 2FA status:', error)
    toast.error(t('settings.account.twoFactor.fetchError'))
  } finally {
    isLoading2FAStatus.value = false
  }
}

function handleManageDevices() {
  showDeviceManagementDialog.value = true
}

function handleResetPassword() {
  showResetPasswordDialog.value = true
}

function handleToggle2FA() {
  if (is2FAEnabled.value) {
    // Show disable dialog
    show2FADisableDialog.value = true
  } else {
    // Show setup dialog
    show2FASetupDialog.value = true
  }
}

function handleRegenerateCodes() {
  showRegenerateCodesDialog.value = true
}

function handle2FASuccess() {
  // Refresh 2FA status after successful operation
  fetch2FAStatus()
}
</script>

<template>
  <div class="space-y-6">
    <!-- Account Information Section -->
    <Card>
      <CardHeader>
        <div class="flex items-center gap-2">
          <UserIcon class="size-5 text-muted-foreground" />
          <CardTitle>{{ t('settings.account.accountInformation') }}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div class="flex flex-col md:flex-row gap-6">
          <!-- User Info -->
          <div class="flex-1 space-y-4">
            <div class="space-y-2">
              <Label class="text-sm font-medium">{{ t('settings.account.username') }}</Label>
              <div
                v-if="!isLoadingUserInfo"
                class="h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm text-black dark:bg-white dark:text-black flex items-center"
              >
                {{ userName }}
              </div>
              <Skeleton v-else class="h-10 w-full" />
            </div>
            <div class="space-y-2">
              <Label class="text-sm font-medium">{{ t('settings.account.email') }}</Label>
              <div
                v-if="!isLoadingUserInfo"
                class="h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm text-black dark:bg-white dark:text-black flex items-center"
              >
                {{ userEmail }}
              </div>
              <Skeleton v-else class="h-10 w-full" />
            </div>
            <div class="space-y-2">
              <Label class="text-sm font-medium">{{ t('settings.account.plan') }}</Label>
              <div
                v-if="!isLoadingUserInfo"
                class="h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm text-black dark:bg-white dark:text-black flex items-center"
              >
                {{ userPlanDisplay }}
              </div>
              <Skeleton v-else class="h-10 w-full" />
            </div>
          </div>

          <!-- Avatar Section -->
          <div class="flex flex-col items-center justify-center md:justify-start gap-4 md:border-l md:pl-6">
            <div class="w-24 h-24 rounded-full bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden">
              <Skeleton v-if="isLoadingAvatar && !userAvatar" class="w-full h-full rounded-full" />
              <img v-else-if="userAvatar" :src="userAvatar" alt="User avatar" class="w-full h-full object-cover" />
              <UserIcon v-else class="size-12 text-muted-foreground" />
            </div>
            <Button
              variant="outline"
              size="sm"
              class="text-xs"
              @click="showAvatarCropDialog = true"
            >
              {{ t('settings.account.changeAvatar') }}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Security Section -->
    <Card>
      <CardHeader>
        <div class="flex items-center gap-2">
          <Shield class="size-5 text-muted-foreground" />
          <CardTitle>{{ t('settings.account.security') }}</CardTitle>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- Device Management -->
        <div class="rounded-lg border p-4">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="space-y-1">
              <Label class="text-base font-medium">{{ t('settings.account.devices.title') }}</Label>
              <!-- <p class="text-sm text-muted-foreground">{{ t('settings.account.devices.description') }}</p> -->
            </div>
            <Button @click="handleManageDevices" variant="outline" class="w-full md:w-auto shrink-0">
              {{ t('settings.account.devices.title') }}
            </Button>
          </div>
        </div>

        <!-- Reset Password -->
        <div class="rounded-lg border p-4">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="space-y-1">
              <Label class="text-base font-medium">{{ t('settings.account.resetPassword') }}</Label>
              <!-- <p class="text-sm text-muted-foreground">{{ t('settings.account.resetPasswordDesc') }}</p> -->
            </div>
            <Button @click="handleResetPassword" variant="outline" class="w-full md:w-auto shrink-0">
              {{ t('settings.account.resetPassword') }}
            </Button>
          </div>
        </div>

        <!-- 2FA Status and Action -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-lg border p-4">
          <div class="space-y-0.5">
            <div class="flex items-center gap-2 flex-wrap">
              <Label class="text-base font-medium">
                {{ t('settings.account.twoFactor.title') }}
              </Label>
              <span 
                v-if="!isLoading2FAStatus"
                class="text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
                :class="is2FAEnabled ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'"
              >
                {{ is2FAEnabled ? t('settings.account.twoFactor.enabled') : t('settings.account.twoFactor.disabled') }}
              </span>
            </div>
            <!-- <p v-if="!isLoading2FAStatus && is2FAEnabled" class="text-sm text-muted-foreground">
              {{ t('settings.account.twoFactor.backupCodes') }}: {{ backupCodesRemaining }}
            </p> -->
          </div>
          <div v-if="isLoading2FAStatus">
            <Skeleton class="h-9 w-20" />
          </div>
          <div v-else class="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <Button 
              v-if="is2FAEnabled"
              @click="handleRegenerateCodes" 
              variant="outline" 
              size="default"
              class="gap-2 w-full md:w-auto shrink-0"
            >
              <RefreshCw class="size-4" />
              <span class="truncate">{{ t('settings.account.twoFactor.regenerateButton') }}</span>
            </Button>
            <Button 
              @click="handleToggle2FA"
              :variant="is2FAEnabled ? 'outline' : 'default'"
              :class="[
                is2FAEnabled ? 'text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400' : '',
                'w-full md:w-auto shrink-0'
              ]"
            >
              <span class="truncate">{{ is2FAEnabled ? t('settings.account.twoFactor.disableButton') : t('settings.account.twoFactor.enable') }}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Dialogs -->
    <AvatarCropDialog
      v-model:open="showAvatarCropDialog"
      @success="handleAvatarSuccess"
    />
    <DeviceManagementDialog
      v-model:open="showDeviceManagementDialog"
    />
    <ResetPasswordDialog
      v-model:open="showResetPasswordDialog"
    />
    <TwoFactorSetupDialog 
      v-model:open="show2FASetupDialog"
      @success="handle2FASuccess"
    />
    <TwoFactorDisableDialog 
      v-model:open="show2FADisableDialog"
      @success="handle2FASuccess"
    />
    <RegenerateBackupCodesDialog 
      v-model:open="showRegenerateCodesDialog"
      @success="handle2FASuccess"
    />
  </div>
</template>
