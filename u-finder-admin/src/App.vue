<!-- This code was completed by GRP Team 2025.11. -->
<script setup lang="ts">
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'

// Initialize theme from localStorage on app startup
const savedTheme = localStorage.getItem('theme')
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark')
} else if (!savedTheme) {
  // No saved preference — follow system
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark')
  }
}
</script>

<template>
  <Toaster position="bottom-right" :duration="3000" richColors />
  <div id="app">
    <router-view />
  </div>
</template>