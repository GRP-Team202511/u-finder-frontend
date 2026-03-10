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
import { get2FAStatus } from '@/api/userApi'

const { t } = useI18n()
const userStore = useUserStore()

// User info - TODO: Add email and user type to User interface when available from API
const userEmail = ref('user@example.com') // Placeholder
const userType = ref('Student') // Placeholder
const userAvatar = ref('') // Placeholder - will be fetched from API

// 2FA state
const is2FAEnabled = ref(false)
const backupCodesRemaining = ref(0)
const isLoading2FAStatus = ref(false)

// Dialogs state
const showResetPasswordDialog = ref(false)
const show2FASetupDialog = ref(false)
const show2FADisableDialog = ref(false)
const showRegenerateCodesDialog = ref(false)

// Fetch 2FA status on mount
onMounted(async () => {
  await fetch2FAStatus()
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

function handleResetPassword() {
  // TODO: Implement reset password dialog
  showResetPasswordDialog.value = true
  toast.info('Reset password feature coming soon')
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
              <Label for="username" class="text-sm font-medium">{{ t('settings.account.username') }}</Label>
              <Input
                id="username"
                :value="userStore.user?.name"
                disabled
                class="bg-muted"
              />
            </div>
            <div class="space-y-2">
              <Label for="email" class="text-sm font-medium">{{ t('settings.account.email') }}</Label>
              <Input
                id="email"
                :value="userEmail"
                disabled
                class="bg-muted"
              />
            </div>
            <div class="space-y-2">
              <Label for="usertype" class="text-sm font-medium">{{ t('settings.account.userType') }}</Label>
              <Input
                id="usertype"
                :value="userType"
                disabled
                class="bg-muted"
              />
            </div>
          </div>

          <!-- Avatar Section -->
          <div class="flex flex-col items-center justify-center md:justify-start gap-4 md:border-l md:pl-6">
            <div class="w-24 h-24 rounded-full bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
              <UserIcon v-if="!userAvatar" class="size-12 text-muted-foreground" />
              <img v-else :src="userAvatar" alt="User avatar" class="w-full h-full rounded-full object-cover" />
            </div>
            <Button variant="outline" size="sm" class="text-xs">{{ t('settings.account.changeAvatar') }}</Button>
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
        <!-- Reset Password -->
        <div class="rounded-lg border p-4">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="space-y-1">
              <Label class="text-base font-medium">{{ t('settings.account.resetPassword') }}</Label>
              <p class="text-sm text-muted-foreground">{{ t('settings.account.resetPasswordDesc') }}</p>
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

    <!-- TODO: Add Reset Password Dialog -->
  </div>
</template>
