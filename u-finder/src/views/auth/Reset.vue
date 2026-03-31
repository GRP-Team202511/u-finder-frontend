<!-- This code was completed by GRP Team 2025.11. -->
<script setup lang="ts">
import ResetForm from "@/components/auth/Reset/ResetForm.vue";
import AuthTopNav from "@/components/auth/AuthTopNav.vue"
</script>

<template>
  <div class="min-h-dvh flex flex-col">
    <AuthTopNav />
    <div class="flex flex-1 items-center justify-center p-4 sm:p-6 md:p-8">
      <div class="flex w-full max-w-sm flex-col gap-6">
        <ResetForm />
      </div>
    </div>
  </div>
</template>
