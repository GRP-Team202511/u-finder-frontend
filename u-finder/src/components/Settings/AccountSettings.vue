<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Mail, KeyRound, Shield, RefreshCw } from 'lucide-vue-next'
import { useUserStore } from '@/stores/userStore'
import TwoFactorSetupDialog from './TwoFactorSetupDialog.vue'
import TwoFactorDisableDialog from './TwoFactorDisableDialog.vue'
import RegenerateBackupCodesDialog from './RegenerateBackupCodesDialog.vue'
// import { get2FAStatus } from '@/api/userApi'

const { t } = useI18n()
const userStore = useUserStore()

// User email - TODO: Add email to User interface when available from API
const userEmail = ref('user@example.com') // Placeholder

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
    // TODO: Uncomment when API is implemented
    // const response = await get2FAStatus()
    // is2FAEnabled.value = response.is_2fa_enabled
    // backupCodesRemaining.value = response.backup_codes_remaining
    
    // Mock data for now
    is2FAEnabled.value = false
    backupCodesRemaining.value = 0
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
    <!-- Email Section -->
    <Card>
      <CardHeader>
        <div class="flex items-center gap-2">
          <Mail class="size-5 text-muted-foreground" />
          <CardTitle>{{ t('settings.account.email') }}</CardTitle>
        </div>
        <CardDescription>{{ t('settings.account.emailDesc') }}</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex items-center gap-4">
          <Input
            :value="userEmail"
            disabled
            class="max-w-md"
          />
        </div>
      </CardContent>
    </Card>

    <!-- Password Section -->
    <Card>
      <CardHeader>
        <div class="flex items-center gap-2">
          <KeyRound class="size-5 text-muted-foreground" />
          <CardTitle>{{ t('settings.account.password') }}</CardTitle>
        </div>
        <CardDescription>{{ t('settings.account.resetPasswordDesc') }}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button @click="handleResetPassword" variant="outline">
          {{ t('settings.account.resetPassword') }}
        </Button>
      </CardContent>
    </Card>

    <!-- Two-Factor Authentication Section -->
    <Card>
      <CardHeader>
        <div class="flex items-center gap-2">
          <Shield class="size-5 text-muted-foreground" />
          <CardTitle>{{ t('settings.account.twoFactor.title') }}</CardTitle>
        </div>
        <CardDescription>{{ t('settings.account.twoFactor.description') }}</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- 2FA Status and Action -->
        <div class="flex items-center justify-between rounded-lg border p-4">
          <div class="space-y-0.5">
            <div class="flex items-center gap-2">
              <Label class="text-base font-medium">
                {{ t('settings.account.twoFactor.title') }}
              </Label>
              <span 
                v-if="!isLoading2FAStatus"
                class="text-xs font-medium px-2 py-0.5 rounded-full"
                :class="is2FAEnabled ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'"
              >
                {{ is2FAEnabled ? t('settings.account.twoFactor.enabled') : t('settings.account.twoFactor.disabled') }}
              </span>
            </div>
            <p v-if="!isLoading2FAStatus && is2FAEnabled" class="text-sm text-muted-foreground">
              {{ t('settings.account.twoFactor.backupCodes') }}: {{ backupCodesRemaining }}
            </p>
          </div>
          <div v-if="isLoading2FAStatus">
            <Skeleton class="h-9 w-20" />
          </div>
          <Button 
            v-else
            @click="handleToggle2FA"
            :variant="is2FAEnabled ? 'outline' : 'default'"
            :class="is2FAEnabled ? 'text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400' : ''"
          >
            {{ is2FAEnabled ? t('settings.account.twoFactor.disable') : t('settings.account.twoFactor.enable') }}
          </Button>
        </div>

        <!-- Regenerate Backup Codes Button (only show when 2FA is enabled) -->
        <div v-if="!isLoading2FAStatus && is2FAEnabled" class="pt-2">
          <Separator class="mb-4" />
          <Button @click="handleRegenerateCodes" variant="outline" class="gap-2">
            <RefreshCw class="size-4" />
            {{ t('settings.account.twoFactor.regenerate') }}
          </Button>
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
