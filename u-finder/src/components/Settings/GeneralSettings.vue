<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Moon, Sun, Languages } from 'lucide-vue-next'
import LanguageSelector from '@/components/LanguageSelector.vue'

const { t } = useI18n()

// Dark mode state
const isDarkMode = ref(false)

// Initialize dark mode from document class
onMounted(() => {
  // Check if dark class is present on html element
  isDarkMode.value = document.documentElement.classList.contains('dark')
  
  // Or check localStorage if you're using it
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
  } else if (savedTheme === 'light') {
    isDarkMode.value = false
    document.documentElement.classList.remove('dark')
  } else {
    // System preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDarkMode.value = prefersDark
    if (prefersDark) {
      document.documentElement.classList.add('dark')
    }
  }
})

function toggleDarkMode(checked: boolean) {
  isDarkMode.value = checked
  
  if (checked) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Appearance Section -->
    <Card>
      <CardHeader>
        <CardTitle>{{ t('settings.general.appearance') }}</CardTitle>
        <CardDescription>{{ t('settings.general.appearanceDesc') }}</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- Dark Mode Toggle -->
        <div class="flex items-center justify-between rounded-lg border p-4">
          <div class="flex items-center gap-3">
            <div class="rounded-md bg-muted p-2">
              <Moon v-if="isDarkMode" class="size-5 text-foreground" />
              <Sun v-else class="size-5 text-foreground" />
            </div>
            <div class="space-y-0.5">
              <Label class="text-base font-medium">
                {{ t('settings.general.darkMode') }}
              </Label>
              <p class="text-sm text-muted-foreground">
                {{ t('settings.general.darkModeDesc') }}
              </p>
            </div>
          </div>
          <Switch 
            :checked="isDarkMode"
            @update:checked="toggleDarkMode"
          />
        </div>
      </CardContent>
    </Card>

    <!-- Language Section -->
    <Card>
      <CardHeader>
        <div class="flex items-center gap-2">
          <Languages class="size-5 text-muted-foreground" />
          <CardTitle>{{ t('settings.general.language') }}</CardTitle>
        </div>
        <CardDescription>{{ t('settings.general.languageDesc') }}</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="max-w-xs">
          <LanguageSelector />
        </div>
      </CardContent>
    </Card>
  </div>
</template>
