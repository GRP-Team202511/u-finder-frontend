<script setup lang="ts">
import { Button } from "@/components/ui/button"
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
} from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useI18n } from "vue-i18n";
import { ref } from "vue";
import { verifySignup, resendSignupCode } from "@/api/userApi";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "vue-router";
import { Toaster, toast } from 'vue-sonner'
import { Spinner } from "@/components/ui/spinner"

const userStore = useUserStore()
const router = useRouter()
const { t } = useI18n()

const verifying = ref(false)
const incorrect = ref(false)
const resending = ref(false)

const props = defineProps<{
  tempToken: string
}>()

const otpValue = ref("")

const handleOTP = async() => {
  verifying.value = true

  try {
    // console.log(props.tempToken)
    const response = await verifySignup({ code: otpValue.value }, props.tempToken)
    console.log('Verification successful')
    userStore.setUser(response.data)
    toast.success(t("signup.verification.success"))
    router.push('/')
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.log("Wrong OTP code")
      otpValue.value = ""
      incorrect.value = true
      toast.error(t("signup.verification.incorrect"))
    } else if (error.response?.status === 404) {
      toast.error(t("signup.verification.notFound"))
    } else {
      console.error('Verification error:', error)
      toast.error(t("signup.verification.error"))
    }
  } finally {
    verifying.value = false
  }
}

const handleResend = async() => {
  resending.value = true

  try {
    await resendSignupCode(props.tempToken)
    toast.success(t("signup.verification.resent"))
  } catch (error: any) {
    if (error.response?.status === 401) {
      toast.error(t("signup.verification.tokenExpired"))
    } else if (error.response?.status === 429) {
      const retryAfter = error.response.data?.retryAfter || 60
      toast.error(t("signup.verification.tooMany", { seconds: retryAfter }))
    } else {
      console.error('Resend error:', error)
      toast.error(t("signup.verification.resendError"))
    }
  } finally {
    resending.value = false
  }
}
</script>

<template>
  <Toaster />
  <Card>
    <CardHeader>
      <CardTitle>{{ t("signup.verification.enter") }}</CardTitle>
      <CardDescription>{{ t("signup.verification.sent") }}</CardDescription>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="handleOTP">
        <FieldGroup>
          <Field>
            <FieldLabel for="otp" class="text-center">
              <!-- Verification code -->
            </FieldLabel>
            <div class="flex justify-center">
              <InputOTP id="otp" v-model="otpValue" :maxlength="6" required>
                <InputOTPGroup class="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                  <InputOTPSlot :index="0" />
                  <InputOTPSlot :index="1" />
                  <InputOTPSlot :index="2" />
                  <InputOTPSlot :index="3" />
                  <InputOTPSlot :index="4" />
                  <InputOTPSlot :index="5" />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <FieldDescription class="text-center">
              {{ t("signup.verification.enter2") }}
            </FieldDescription>
          </Field>
          <FieldGroup>
            <Button type="submit" :disabled="verifying">
              <Spinner v-if="verifying" class="animate-spin mr-2" />
              {{ t("signup.verification.verify") }}
            </Button>
            <FieldDescription class="text-center">
              {{ t("signup.verification.receive") }}
              <a href="#" @click.prevent="handleResend" :class="{ 'pointer-events-none opacity-50': resending }">
                {{ resending ? t("signup.verification.resending") : t("signup.verification.resend") }}
              </a>
            </FieldDescription>
          </FieldGroup>
        </FieldGroup>
      </form>
    </CardContent>
  </Card>
</template>
