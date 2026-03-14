<script setup lang="ts">
import OTPForm from "@/components/auth/Signup/OTPForm.vue";
import SignupForm from "@/components/auth/Signup/SignupForm.vue"
import LanguageSelector from "@/components/LanguageSelector.vue"
import { Toaster, toast } from 'vue-sonner'
import { ref } from "vue";
import { useI18n } from "vue-i18n";

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
</script>

<template>
  <Toaster />
  <div class='flex px-8 py-4 justify-end'>
    <header>
      <LanguageSelector />
    </header>
  </div>
  <div class="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
    <div class="flex w-full max-w-sm flex-col gap-6">
      <SignupForm v-if="!codeSent" @signup="handleSignupSubmit" @signup-success="handleSignupSuccess" />
      <OTPForm v-if="codeSent" :temp-token="tempToken" />
    </div>
  </div>
</template>
