<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { ref, computed } from 'vue'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useI18n } from 'vue-i18n'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from 'vue-sonner'
import { resetPassword, verifyResetPassword, resendResetPasswordCode } from "@/api/userApi"
import { useRouter } from "vue-router"

const { t } = useI18n()
const router = useRouter()

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

// Form state
const email = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const otpCode = ref('')
const tempToken = ref('')
const isLoading = ref(false)
const isSendingCode = ref(false)
const currentStep = ref(1) // 1 = Enter email & send code, 2 = Enter OTP & new password
const countdown = ref(0)
let countdownTimer: number | null = null

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
const sendOTP = async() => {
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
const resendCode = async() => {
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
      // Reset form state
      currentStep.value = 1
      tempToken.value = ''
      countdown.value = 0
      if (countdownTimer) clearInterval(countdownTimer)
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
const handleSubmit = async(e: Event) => {
  e.preventDefault()

  if (!tempToken.value) {
    toast.error(t('login.reset.errors.sendCodeFirst'))
    return
  }

  if (!otpCode.value || !newPassword.value || !confirmPassword.value) {
    toast.error(t('login.reset.errors.fieldsRequired'))
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    toast.error(t('login.reset.errors.passwordMismatch'))
    return
  }

  isLoading.value = true
  try {
    const response = await verifyResetPassword(
      { 
        code: otpCode.value, 
        newPassword: newPassword.value 
      },
      tempToken.value
    )
    toast.success(t('login.reset.success.passwordReset'))
    
    // Redirect to login page after successful reset
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } catch (error: any) {
    if (error.response?.status === 401) {
      const errorMsg = error.response?.data?.message || ''
      if (errorMsg.includes('Wrong verification code')) {
        toast.error(t('login.reset.errors.wrongCode'))
      } else if (errorMsg.includes('Token expired')) {
        toast.error(t('login.reset.errors.tokenExpired'))
        // Reset form state
        currentStep.value = 1
        tempToken.value = ''
        countdown.value = 0
        if (countdownTimer) clearInterval(countdownTimer)
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

// Go back to step 1 to change email
const goBack = () => {
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
const resendButtonText = computed(() =>
  countdown.value > 0 ? `${countdown.value}s` : t('login.reset.resendCode')
)
</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <Card>
      <CardHeader class="text-center">
        <CardTitle class="text-3xl font-bold">
          {{ t("login.reset.title") }}
        </CardTitle>
        <CardDescription>
          {{
            currentStep === 1
              ? t("login.reset.step1Desc")
              : t("login.reset.step2Desc")
          }}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <!-- Step 1: Enter email and send verification code -->
        <form v-if="currentStep === 1" @submit.prevent="sendOTP">
          <FieldGroup>
            <Field>
              <FieldLabel for="email">{{ t("login.email") }}</FieldLabel>
              <Input
                id="email"
                v-model="email"
                type="email"
                required
                :placeholder="t('login.reset.emailPlaceholder')"
              />
              <FieldDescription class="text-muted-foreground text-sm mt-1">
                {{ t("login.reset.step1Hint") }}
              </FieldDescription>
            </Field>
            <FieldSeparator />
            <Field>
              <Button
                type="submit"
                class="w-full"
                :disabled="isSendingCode || !email"
              >
                <Spinner v-if="isSendingCode" class="mr-2" />
                {{ t("login.reset.sendCode") }}
              </Button>
            </Field>
          </FieldGroup>
        </form>

        <!-- Step 2: Enter OTP and new password -->
        <form v-else-if="currentStep === 2" @submit="handleSubmit">
          <FieldGroup>
            <Field>
              <FieldLabel class="text-muted-foreground">{{ t("login.email") }}</FieldLabel>
              <div class="rounded-md border border-input bg-muted/50 px-3 py-2 text-sm">
                {{ email }}
              </div>
            </Field>
            <Field>
              <FieldLabel for="password">{{ t("login.reset.newPassword") }}</FieldLabel>
              <Input
                id="password"
                v-model="newPassword"
                type="password"
                required
              />
            </Field>
            <Field>
              <FieldLabel for="confirm-password">{{ t("login.reset.confirmPassword") }}</FieldLabel>
              <Input
                id="confirm-password"
                v-model="confirmPassword"
                type="password"
                required
              />
            </Field>
            <Field>
              <FieldLabel for="otp">{{ t("login.reset.otp") }}</FieldLabel>
              <div class="flex w-full items-center gap-2">
                <Input
                  id="otp"
                  v-model="otpCode"
                  type="text"
                  inputmode="numeric"
                  maxlength="6"
                  :placeholder="t('login.reset.otpPlaceholder')"
                  class="flex-1"
                />
                <Button
                  type="button"
                  variant="default"
                  :disabled="!canResend"
                  @click="resendCode"
                >
                  <Spinner v-if="isSendingCode" class="mr-2" />
                  {{ resendButtonText }}
                </Button>
              </div>
            </Field>
            <FieldSeparator />
            <Field class="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                :disabled="isLoading"
                @click="goBack"
              >
                {{ t("login.reset.back") }}
              </Button>
              <Button
                type="submit"
                class="w-full"
                :disabled="isLoading || !otpCode || !newPassword || !confirmPassword"
              >
                <Spinner v-if="isLoading" class="mr-2" />
                {{ t("login.reset.send") }}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  </div>
</template>