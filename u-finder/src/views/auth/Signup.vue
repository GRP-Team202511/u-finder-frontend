<script setup lang="ts">
import SignupForm from "@/components/auth/SIgnup/SignupForm.vue"
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
      <SignupForm />
    </div>
  </div>
</template>
