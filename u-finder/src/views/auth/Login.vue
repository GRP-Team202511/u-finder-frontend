<script setup lang="ts">
import { ref } from "vue";
import LoginForm from "@/components/auth/Login/LoginForm.vue";
import TwoFactorForm from "@/components/auth/Login/TwoFactorForm.vue";
import AuthTopNav from "@/components/auth/AuthTopNav.vue";

type AuthNavName = 'Cover' | 'Login' | 'Signup'

const tempToken = ref("");

const handleTwoFactor = (token: string) => {
  tempToken.value = token;
};

const handleNav = (target: AuthNavName) => {
  if (target === 'Login') {
    tempToken.value = ''
  }
}

</script>

<template>
  <div class="min-h-dvh flex flex-col">
    <AuthTopNav :active-override="tempToken ? 'none' : 'auto'" @navigate="handleNav" />
    <div class="flex flex-1 items-center justify-center p-4 sm:p-6 md:p-8">
      <div class="flex w-full max-w-sm flex-col gap-6">
        <LoginForm v-if="!tempToken" @two-factor="handleTwoFactor" />
        <TwoFactorForm v-else :temp-token="tempToken" />
      </div>
    </div>
  </div>
</template>
