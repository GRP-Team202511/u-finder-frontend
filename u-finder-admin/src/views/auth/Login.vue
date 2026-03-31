<!-- This code was completed by GRP Team 2025.11. -->
<script setup lang="ts">
import { ref } from "vue";
import LoginForm from "@/components/auth/Login/LoginForm.vue";
import TwoFactorForm from "@/components/auth/Login/TwoFactorForm.vue";
import LanguageSelector from "@/components/LanguageSelector.vue";

const tempToken = ref("");

const handleTwoFactor = (token: string) => {
  tempToken.value = token;
};

</script>

<template>
  <div class='flex p-4 md:px-8 flex justify-end'>
    <header>
      <LanguageSelector />
    </header>
  </div>
  <div class="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
    <div class="flex w-full max-w-sm flex-col gap-6">
      <LoginForm v-if="!tempToken" @two-factor="handleTwoFactor" />
      <TwoFactorForm v-else :temp-token="tempToken" />
    </div>
  </div>
</template>
