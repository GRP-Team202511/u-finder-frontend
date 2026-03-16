<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { ref } from 'vue'
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
const isEmailSent = ref(false)
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
    isEmailSent.value = true
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
      isEmailSent.value = false
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
        isEmailSent.value = false
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
</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <Card>
      <CardHeader class="text-center">
          <CardTitle class="text-3xl font-bold">
            {{ t("login.reset.title") }}
          </CardTitle>
          <CardDescription>
            {{ t("login.reset.description") }}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form @submit="handleSubmit">
            <FieldGroup>
              <Field>
                <FieldLabel for="email">
                  {{ t("login.email") }}
                </FieldLabel>
                <Input
                  id="email"
                  v-model="email"
                  type="email"
                  :disabled="isEmailSent"
                  required
                />
              </Field>
              <Field>
                <FieldLabel for="password">
                  {{ t("login.reset.newPassword") }}
                </FieldLabel>
                <Input
                  id="password"
                  v-model="newPassword"
                  type="password"
                  :disabled="!isEmailSent"
                  required
                />
              </Field>
              <Field>
                <FieldLabel for="confirm-password">
                  {{ t("login.reset.confirmPassword") }}
                </FieldLabel>
                <Input
                  id="confirm-password"
                  v-model="confirmPassword"
                  type="password"
                  :disabled="!isEmailSent"
                  required
                />
              </Field>
              <Field>
                <FieldLabel for="otp">
                  {{ t("login.reset.otp") }}
                </FieldLabel>
                <div class="flex w-full max-w-sm items-center space-x-2">
                  <Input 
                    id="otp"
                    v-model="otpCode"
                    :disabled="!isEmailSent"
                  />
                  <Button 
                    type="button"
                    @click="isEmailSent ? resendCode() : sendOTP()"
                    :disabled="isSendingCode || countdown > 0"
                  >
                    <Spinner v-if="isSendingCode" class="mr-2" />
                    <template v-if="countdown > 0">
                      {{ countdown }}s
                    </template>
                    <template v-else>
                      {{ isEmailSent ? t("login.reset.resendCode") : t("login.reset.sendCode") }}
                    </template>
                  </Button>
                </div>
              </Field>
              <FieldSeparator />
              <Field>
                <Button 
                  type="submit"
                  :disabled="isLoading || !isEmailSent || !newPassword || !confirmPassword"
                  class="w-full"
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