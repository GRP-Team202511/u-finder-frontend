<script setup lang="ts">
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)')

type ThemeMode = 'system' | 'light' | 'dark'

function getStoredThemeMode(): ThemeMode {
  const stored = localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') {
    return stored
  }
  return 'system'
}

function getResolvedTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'dark') return 'dark'
  if (mode === 'light') return 'light'
  return systemThemeQuery.matches ? 'dark' : 'light'
}

function applyResolvedTheme(mode: ThemeMode) {
  const resolved = getResolvedTheme(mode)
  document.documentElement.classList.toggle('dark', resolved === 'dark')
  // Keep native controls aligned with resolved appearance.
  document.documentElement.style.colorScheme = resolved
}

function applyThemeForCurrentContext() {
  if (!userStore.isLoggedIn) {
    // Guest/auth pages always follow system by default.
    applyResolvedTheme('system')
    return
  }

  applyResolvedTheme(getStoredThemeMode())
}

const handleSystemThemeChange = () => {
  if (!userStore.isLoggedIn || getStoredThemeMode() === 'system') {
    applyThemeForCurrentContext()
  }
}

const handleThemeChangeEvent = () => {
  applyThemeForCurrentContext()
}

onMounted(() => {
  applyThemeForCurrentContext()
  systemThemeQuery.addEventListener('change', handleSystemThemeChange)
  window.addEventListener('storage', handleThemeChangeEvent)
  window.addEventListener('theme-change', handleThemeChangeEvent)
})

onBeforeUnmount(() => {
  systemThemeQuery.removeEventListener('change', handleSystemThemeChange)
  window.removeEventListener('storage', handleThemeChangeEvent)
  window.removeEventListener('theme-change', handleThemeChangeEvent)
})

watch(
  () => userStore.isLoggedIn,
  () => {
    applyThemeForCurrentContext()
  }
)
</script>

<template>
  <Toaster position="bottom-right" :duration="3000" richColors />
  <div id="app">
    <router-view />
  </div>
</template>

