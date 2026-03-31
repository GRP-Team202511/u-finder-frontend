<!-- This code was completed by GRP Team 2025.11. -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Spinner } from '@/components/ui/spinner'
import { AlertTriangle } from 'lucide-vue-next'
import { resetPassword, verifyResetPassword, resendResetPasswordCode, getUserInfo } from '@/api/userApi'

const { t } = useI18n()

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'success': []
}>()

// Form state
const email = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const otpCode = ref('')
const tempToken = ref('')
const currentStep = ref(1) // 1 = Confirm email and send code, 2 = Verify OTP & set new password
const isLoading = ref(false)
const isLoadingEmail = ref(false)
const isSendingCode = ref(false)
const countdown = ref(0)
let countdownTimer: number | null = null
const otpCodeValid = computed(() => /^\d{6}$/.test(otpCode.value))

// Watch dialog open state to reset and fetch user info
watch(() => props.open, (newValue) => {
  if (newValue) {
    resetDialog()
    fetchUserEmail()
  } else {
    if (countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }
})

// Auto-submit when 6-digit code is entered on step 2
watch(otpCode, (newValue) => {
  const digitsOnly = newValue.replace(/\D/g, '').slice(0, 6)
  if (digitsOnly !== newValue) {
    otpCode.value = digitsOnly
    return
  }

  if (currentStep.value === 2 && newValue.length === 6 && !isLoading.value) {
    // Optionally auto-submit or just wait for user to click button
  }
})

function resetDialog() {
  currentStep.value = 1
  email.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  otpCode.value = ''
  tempToken.value = ''
  isLoading.value = false
  isLoadingEmail.value = false
  isSendingCode.value = false
  countdown.value = 0
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

// Fetch user email
const fetchUserEmail = async () => {
  isLoadingEmail.value = true
  try {
    const response = await getUserInfo()
    email.value = response.data.email
  } catch (error: any) {
    console.error('Failed to fetch user info:', error)
    toast.error(t('settings.account.fetchUserInfoError'))
    // Close dialog if we can't get email
    emit('update:open', false)
  } finally {
    isLoadingEmail.value = false
  }
}

// Start countdown timer
const startCountdown = (seconds: number = 60) => {
  countdown.value = seconds
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer!)
      countdownTimer = null
    }
  }, 1000)
}

// Send reset password request and get temp token
const sendOTP = async () => {
  if (!email.value) {
    toast.error(t('login.reset.errors.emailRequired'))
    return
  }

  isSendingCode.value = true
  try {
    const response = await resetPassword({ email: email.value })
    tempToken.value = response.data.temp_token
    currentStep.value = 2
    startCountdown(60)
    toast.success(t('login.reset.success.codeSent'))
  } catch (error: any) {
    if (error.response?.status === 404) {
      toast.error(t('login.reset.errors.emailNotFound'))
    } else if (error.response?.status === 422) {
      toast.error(t('login.reset.errors.invalidEmail'))
    } else {
      toast.error(t('login.reset.errors.sendFailed'))
    }
  } finally {
    isSendingCode.value = false
  }
}

// Resend verification code
const resendCode = async () => {
  if (!tempToken.value) {
    toast.error(t('login.reset.errors.tokenMissing'))
    return
  }

  if (countdown.value > 0) {
    return
  }

  isSendingCode.value = true
  try {
    await resendResetPasswordCode(tempToken.value)
    startCountdown(60)
    toast.success(t('login.reset.success.codeResent'))
  } catch (error: any) {
    if (error.response?.status === 401) {
      toast.error(t('login.reset.errors.tokenExpired'))
      // Reset to step 1
      resetDialog()
    } else if (error.response?.status === 429) {
      const retryAfter = error.response?.data?.retryAfter || 60
      toast.error(t('login.reset.errors.rateLimited', { seconds: retryAfter }))
      startCountdown(retryAfter)
    } else {
      toast.error(t('login.reset.errors.resendFailed'))
    }
  } finally {
    isSendingCode.value = false
  }
}

// Submit form to verify OTP and reset password
const handleResetPassword = async () => {
  if (!tempToken.value) {
    toast.error(t('login.reset.errors.sendCodeFirst'))
    return
  }

  if (!otpCode.value || !newPassword.value || !confirmPassword.value) {
    toast.error(t('login.reset.errors.fieldsRequired'))
    return
  }

  if (!otpCodeValid.value) {
    toast.error(t('login.reset.errors.wrongCode'))
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    toast.error(t('settings.account.resetPasswordDialog.passwordMismatch'))
    return
  }

  if (newPassword.value.length < 8) {
    toast.error(t('settings.account.resetPasswordDialog.passwordTooShort'))
    return
  }

  isLoading.value = true
  try {
    await verifyResetPassword(
      {
        code: otpCode.value,
        newPassword: newPassword.value
      },
      tempToken.value
    )
    toast.success(t('settings.account.resetPasswordDialog.success'))
    emit('success')
    emit('update:open', false)
  } catch (error: any) {
    if (error.response?.status === 401) {
      const errorMsg = error.response?.data?.message || ''
      if (errorMsg.includes('Wrong verification code')) {
        toast.error(t('login.reset.errors.wrongCode'))
        otpCode.value = ''
      } else if (errorMsg.includes('Token expired')) {
        toast.error(t('login.reset.errors.tokenExpired'))
        resetDialog()
      } else {
        toast.error(t('login.reset.errors.unauthorized'))
      }
    } else if (error.response?.status === 422) {
      toast.error(t('login.reset.errors.invalidInput'))
    } else {
      toast.error(t('login.reset.errors.resetFailed'))
    }
  } finally {
    isLoading.value = false
  }
}

function closeDialog() {
  emit('update:open', false)
}

function goBack() {
  if (currentStep.value === 2) {
    currentStep.value = 1
    otpCode.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    tempToken.value = ''
    countdown.value = 0
    if (countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }
}

const canResend = computed(() => countdown.value === 0 && !isSendingCode.value)
const resendButtonText = computed(() => {
  if (countdown.value > 0) {
    return `${countdown.value}s`
  }
  return t('login.reset.resendCode')
})
</script>

<template>
  <Dialog :open="props.open" @update:open="(val) => emit('update:open', val)">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>{{ t('settings.account.resetPasswordDialog.title') }}</DialogTitle>
        <DialogDescription>
          {{
            currentStep === 1
              ? t('settings.account.resetPasswordDialog.step1Desc')
              : t('settings.account.resetPasswordDialog.step2Desc')
          }}
        </DialogDescription>
      </DialogHeader>

      <!-- Step 1: Confirm Email -->
      <div v-if="currentStep === 1" class="space-y-4 py-4">
        <div class="space-y-2">
          <Label class="text-sm font-medium">{{ t('login.email') }}</Label>
          <div v-if="isLoadingEmail" class="flex items-center justify-center py-4">
            <Spinner class="size-6" />
          </div>
          <div
            v-else
            class="h-9 w-full rounded-md border border-input bg-muted/50 px-3 py-1 text-sm flex items-center"
          >
            {{ email }}
          </div>
          <p class="text-xs text-muted-foreground">
            {{ t('settings.account.resetPasswordDialog.emailConfirmHint') }}
          </p>
        </div>
      </div>

      <!-- Step 2: Verify OTP & Set New Password -->
      <div v-else-if="currentStep === 2" class="space-y-4 py-4">
        <!-- Email display (read-only) -->
        <div class="space-y-2">
          <Label class="text-sm text-muted-foreground">{{ t('login.email') }}</Label>
          <div class="text-sm font-medium">{{ email }}</div>
        </div>

        <!-- OTP Input -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <Label for="reset-otp">{{ t('login.reset.otp') }}</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              :disabled="!canResend"
              @click="resendCode"
              class="h-auto p-0 text-xs"
            >
              <Spinner v-if="isSendingCode" class="mr-1 size-3" />
              {{ resendButtonText }}
            </Button>
          </div>
          <InputOTP
            id="reset-otp"
            v-model="otpCode"
            :maxlength="6"
            class="gap-2"
          >
            <InputOTPGroup>
              <InputOTPSlot :index="0" />
              <InputOTPSlot :index="1" />
              <InputOTPSlot :index="2" />
              <InputOTPSlot :index="3" />
              <InputOTPSlot :index="4" />
              <InputOTPSlot :index="5" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <!-- New Password -->
        <div class="space-y-2">
          <Label for="new-password">{{ t('login.reset.newPassword') }}</Label>
          <Input
            id="new-password"
            v-model="newPassword"
            type="password"
            :placeholder="t('login.reset.newPassword')"
          />
        </div>

        <!-- Confirm Password -->
        <div class="space-y-2">
          <Label for="confirm-password">{{ t('settings.account.resetPasswordDialog.confirmPassword') }}</Label>
          <Input
            id="confirm-password"
            v-model="confirmPassword"
            type="password"
            :placeholder="t('settings.account.resetPasswordDialog.confirmPassword')"
            @keyup.enter="handleResetPassword"
          />
        </div>

        <!-- Warning -->
        <div class="flex gap-2 rounded-md border border-amber-500/50 bg-amber-50 p-3 text-sm dark:bg-amber-950/30">
          <AlertTriangle class="size-4 shrink-0 text-amber-600 dark:text-amber-500 mt-0.5" />
          <p class="text-amber-900 dark:text-amber-200">
            {{ t('settings.account.resetPasswordDialog.warning') }}
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button
          v-if="currentStep === 2"
          type="button"
          variant="outline"
          @click="goBack"
          :disabled="isLoading"
        >
          {{ t('settings.account.twoFactor.setup.back') }}
        </Button>
        <Button
          type="button"
          variant="outline"
          @click="closeDialog"
          :disabled="isLoading"
        >
          {{ t('settings.account.twoFactor.setup.cancel') }}
        </Button>
        <Button
          v-if="currentStep === 1"
          type="button"
          @click="sendOTP"
          :disabled="isSendingCode || isLoadingEmail || !email"
        >
          <Spinner v-if="isSendingCode" class="mr-2" />
          {{ t('login.reset.sendCode') }}
        </Button>
        <Button
          v-else-if="currentStep === 2"
          type="button"
          @click="handleResetPassword"
          :disabled="isLoading || !otpCodeValid || !newPassword || !confirmPassword"
        >
          <Spinner v-if="isLoading" class="mr-2" />
          {{ t('login.reset.send') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
