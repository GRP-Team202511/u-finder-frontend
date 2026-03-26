<script setup lang="ts">
import ResetForm from "@/components/auth/Reset/ResetForm.vue";
import LanguageSelector from "@/components/LanguageSelector.vue"
</script>

<template>
  <div class='flex justify-end px-3 py-3 sm:px-4 sm:py-4 lg:px-8'>
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
