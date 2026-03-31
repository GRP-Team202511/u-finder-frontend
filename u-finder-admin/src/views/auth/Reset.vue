<!-- This code was completed by GRP Team 2025.11. -->
<script setup lang="ts">
import ResetForm from "@/components/auth/Reset/ResetForm.vue";
import LanguageSelector from "@/components/LanguageSelector.vue"
</script>

<template>
  <div class='flex p-4 md:px-8 flex justify-end'>
    <header>
      <LanguageSelector />
    </header>
  </div>
  <div class="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
    <div class="flex w-full max-w-sm flex-col gap-6">
      <ResetForm />
    </div>
  </div>
</template>