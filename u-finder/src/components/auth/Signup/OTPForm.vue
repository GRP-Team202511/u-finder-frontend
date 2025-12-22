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
import http from "@/api/http";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "vue-router";
import { Toaster, toast } from 'vue-sonner'

const userStore = useUserStore()
const router = useRouter()
const { t } = useI18n()

const verifying = ref(false)
const incorrect = ref(false)

const props = defineProps<{
  tempToken: string
}>()

const otpValue = ref("")

const handleOTP = async() => {
  verifying.value = true

  try {
    const response = await http.post('/auth/verify', 
      { code: otpValue.value },
      {
        headers: {
          'temp_token': props.tempToken
        }
      }
    )
    
    if (response.status === 201) {
      console.log('Verification successful')
      userStore.setUser(response.data)
      // TODO: jump to the main page
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.log("Wrong OTP code")
      otpValue.value = ""
      incorrect.value = true
      toast.error(t("signup.verification.incorrect"))
    } else {
      console.error('Verification error:', error)
    }
  } finally {
    verifying.value = false
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
            <Button type="submit" v-if="!verifying">
              {{ t("signup.verification.verify") }}
            </Button>
            <Button varient="outline" v-if="verifying">
              {{ t("signup.verification.verify") }}
            </Button>
            <FieldDescription class="text-center">
              {{ t("signup.verification.receive") }} <a href="#">{{ t("signup.verification.resend") }}</a>
            </FieldDescription>
          </FieldGroup>
        </FieldGroup>
      </form>
    </CardContent>
  </Card>
</template>
