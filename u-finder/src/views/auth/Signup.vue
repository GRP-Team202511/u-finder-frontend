<script setup lang="ts">
import OTPForm from "@/components/auth/Signup/OTPForm.vue";
import SignupForm from "@/components/auth/Signup/SignupForm.vue"
import AuthTopNav from "@/components/auth/AuthTopNav.vue"
import { Toaster, toast } from 'vue-sonner'
import { ref } from "vue";
import { useI18n } from "vue-i18n";

type AuthNavName = 'Cover' | 'Login' | 'Signup'

const { t } = useI18n()
const codeSent = ref(false)

const signupInfo = ref({
  email: '',
  name: '',
})

const tempToken = ref('')

const handleSignupSubmit = (payload: { email: string; name: string }) => {
  signupInfo.value = payload
}

const handleSignupSuccess = (token: string) => {
  toast.success(t("signup.codeSent"))
  tempToken.value = token
  codeSent.value = true
}

const handleBackFromOTP = () => {
  codeSent.value = false
  tempToken.value = ''
}

const handleNav = (target: AuthNavName) => {
  if (target === 'Signup') {
    codeSent.value = false
    tempToken.value = ''
  }
}
</script>

<template>
  <Toaster />
  <div class="min-h-dvh flex flex-col">
    <AuthTopNav :active-override="codeSent ? 'none' : 'auto'" @navigate="handleNav" />
    <div class="flex flex-1 items-center justify-center p-4 sm:p-6 md:p-8">
      <div class="flex w-full max-w-sm flex-col gap-6">
        <SignupForm v-if="!codeSent" @signup="handleSignupSubmit" @signup-success="handleSignupSuccess" />
        <OTPForm
          v-if="codeSent"
          :temp-token="tempToken"
          @back="handleBackFromOTP"
        />
      </div>
    </div>
  </div>
</template>
