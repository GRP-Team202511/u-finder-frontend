<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Moon, Sun, Monitor, FileText, Shield, Scale, ExternalLink, Info, Github } from 'lucide-vue-next'

const { t } = useI18n()
const router = useRouter()

// Theme mode: 'system' | 'light' | 'dark' — defaults to system
const themeMode = ref<'system' | 'light' | 'dark'>('system')

import { version } from '../../../package.json'

// Apply theme based on mode
function applyTheme(mode: 'system' | 'light' | 'dark') {
  if (mode === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.removeItem('theme')
  } else if (mode === 'dark') {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

// Initialize theme from localStorage or default to light
onMounted(() => {
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
  
  if (savedTheme === 'dark') {
    themeMode.value = 'dark'
  } else if (savedTheme === 'light') {
    themeMode.value = 'light'
  } else {
    // No saved preference — follow the system color scheme
    themeMode.value = 'system'
  }
  
  applyTheme(themeMode.value)
  
  // Listen for system theme changes when in system mode
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleChange = () => {
    if (themeMode.value === 'system') {
      applyTheme('system')
    }
  }
  mediaQuery.addEventListener('change', handleChange)
})

// Watch for theme mode changes
watch(themeMode, (newMode) => {
  applyTheme(newMode)
})

function openExternalLink(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

function navigateToTerms() {
  const route = router.resolve({ name: 'TermsOfService' })
  window.open(route.href, '_blank', 'noopener,noreferrer')
}

function navigateToPrivacy() {
  const route = router.resolve({ name: 'PrivacyPolicy' })
  window.open(route.href, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <div class="space-y-6">
    <!-- Appearance Section -->
    <Card>
      <CardHeader>
        <div class="flex items-center gap-2">
          <Moon class="size-5 text-muted-foreground" />
          <CardTitle>{{ t('settings.general.appearance') }}</CardTitle>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- Theme Mode Selector -->
        <div class="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex min-w-0 items-center gap-3">
            <div class="rounded-md bg-muted p-2">
              <Monitor v-if="themeMode === 'system'" class="size-5 text-foreground" />
              <Moon v-else-if="themeMode === 'dark'" class="size-5 text-foreground" />
              <Sun v-else class="size-5 text-foreground" />
            </div>
            <div class="min-w-0 space-y-0.5">
              <Label class="text-base font-medium">
                {{ t('settings.general.theme') }}
              </Label>
              <p class="text-sm text-muted-foreground break-words">
                {{ t('settings.general.themeDesc') }}
              </p>
            </div>
          </div>
          <Select v-model="themeMode">
            <SelectTrigger class="w-full sm:w-35">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">
                <div class="flex items-center gap-2">
                  <Monitor class="size-4" />
                  {{ t('settings.general.system') }}
                </div>
              </SelectItem>
              <SelectItem value="light">
                <div class="flex items-center gap-2">
                  <Sun class="size-4" />
                  {{ t('settings.general.light') }}
                </div>
              </SelectItem>
              <SelectItem value="dark">
                <div class="flex items-center gap-2">
                  <Moon class="size-4" />
                  {{ t('settings.general.dark') }}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    <!-- About U-Finder -->
    <Card>
      <CardHeader>
        <div class="flex items-center gap-2">
          <Info class="size-5 text-muted-foreground" />
          <CardTitle>{{ t('settings.about.title') }}</CardTitle>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- Description -->
        <p class="text-sm text-muted-foreground">
          {{ t('settings.about.description') }}
        </p>

        <!-- Project Info -->
        <div class="space-y-3 rounded-lg border p-4">
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <Label class="text-sm text-muted-foreground">{{ t('settings.about.version') }}</Label>
            <span class="text-sm font-medium break-words">v{{ version }}</span>
          </div>
          <Separator />
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <Label class="text-sm text-muted-foreground">{{ t('settings.about.license') }}</Label>
            <span class="text-sm font-medium break-words">Apache 2.0</span>
          </div>
          <Separator />
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <Label class="text-sm text-muted-foreground">{{ t('settings.about.course') }}</Label>
            <span class="text-sm font-medium break-words">COMP2043 GRP</span>
          </div>
          <Separator />
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <Label class="text-sm text-muted-foreground">{{ t('settings.about.team') }}</Label>
            <span class="text-sm font-medium break-words">Team2025.11</span>
          </div>
          <Separator />
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <Label class="text-sm text-muted-foreground">{{ t('settings.about.university') }}</Label>
            <span class="text-sm font-medium break-words text-left sm:text-right">University of Nottingham Ningbo China</span>
          </div>
        </div>

        <!-- Links -->
        <div class="space-y-2">
          <button
            @click="openExternalLink('https://github.com/GRP-Team202511/u-finder')"
            class="flex w-full items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <div class="flex items-center gap-3">
              <Github class="size-4 text-foreground" />
              <span class="text-sm font-medium">{{ t('settings.about.github') }}</span>
            </div>
            <ExternalLink class="size-4 text-muted-foreground" />
          </button>

          <button
            @click="navigateToTerms"
            class="flex w-full items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <div class="flex items-center gap-3">
              <FileText class="size-4 text-foreground" />
              <span class="text-sm font-medium">{{ t('settings.about.terms') }}</span>
            </div>
            <ExternalLink class="size-4 text-muted-foreground" />
          </button>

          <button
            @click="navigateToPrivacy"
            class="flex w-full items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <div class="flex items-center gap-3">
              <Shield class="size-4 text-foreground" />
              <span class="text-sm font-medium">{{ t('settings.about.privacy') }}</span>
            </div>
            <ExternalLink class="size-4 text-muted-foreground" />
          </button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
