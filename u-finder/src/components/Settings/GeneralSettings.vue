<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Moon, Sun, FileText, Shield, Scale, ExternalLink, Info, Github } from 'lucide-vue-next'

const { t } = useI18n()
const router = useRouter()

// Dark mode state
const isDarkMode = ref(false)

// Version info from environment variable
const version = import.meta.env.VITE_APP_VERSION || '0.0.0'

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
          <div class="flex items-center justify-between">
            <Label class="text-sm text-muted-foreground">{{ t('settings.about.version') }}</Label>
            <span class="text-sm font-medium">v{{ version }}</span>
          </div>
          <Separator />
          <div class="flex items-center justify-between">
            <Label class="text-sm text-muted-foreground">{{ t('settings.about.license') }}</Label>
            <span class="text-sm font-medium">Apache 2.0</span>
          </div>
          <Separator />
          <div class="flex items-center justify-between">
            <Label class="text-sm text-muted-foreground">{{ t('settings.about.course') }}</Label>
            <span class="text-sm font-medium">COMP2043 GRP</span>
          </div>
          <Separator />
          <div class="flex items-center justify-between">
            <Label class="text-sm text-muted-foreground">{{ t('settings.about.team') }}</Label>
            <span class="text-sm font-medium">Team2025.11</span>
          </div>
          <Separator />
          <div class="flex items-center justify-between">
            <Label class="text-sm text-muted-foreground">{{ t('settings.about.university') }}</Label>
            <span class="text-sm font-medium text-right">University of Nottingham Ningbo China</span>
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
