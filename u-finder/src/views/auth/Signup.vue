<script setup lang="ts">
import OTPForm from "@/components/auth/Signup/OTPForm.vue";
import SignupForm from "@/components/auth/Signup/SignupForm.vue"
import LanguageSelector from "@/components/LanguageSelector.vue"
import { ref } from "vue";

const codeSent = ref(false)

const signupInfo = ref({
  email: '',
  name: '',
  password: '',
})

const tempToken = ref('')

const handleSignupSubmit = (payload: { email: string; name: string; password: string }) => {
  signupInfo.value = payload
}

const handleSignupSuccess = (token: string) => {
  tempToken.value = token
  codeSent.value = true
}
</script>

<template>
  <div class='flex p-4 md:px-8 flex justify-end'>
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
