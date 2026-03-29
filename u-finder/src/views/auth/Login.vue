<script setup lang="ts">
import { ref } from "vue";
import LoginForm from "@/components/auth/Login/LoginForm.vue";
import TwoFactorForm from "@/components/auth/Login/TwoFactorForm.vue";
import AuthTopNav from "@/components/auth/AuthTopNav.vue";

const tempToken = ref("");

const handleTwoFactor = (token: string) => {
  tempToken.value = token;
};

</script>

<template>
  <div class="min-h-dvh flex flex-col">
    <AuthTopNav />
    <div class="flex flex-1 items-center justify-center p-4 sm:p-6 md:p-8">
      <div class="flex w-full max-w-sm flex-col gap-6">
        <LoginForm v-if="!tempToken" @two-factor="handleTwoFactor" />
        <TwoFactorForm v-else :temp-token="tempToken" />
      </div>
    </div>
  </div>
</template>
