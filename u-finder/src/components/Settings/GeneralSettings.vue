<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Moon, Sun, FileText, Shield, Scale, ExternalLink, Info } from 'lucide-vue-next'

const { t } = useI18n()

// Dark mode state
const isDarkMode = ref(false)

// Version info from environment variable
const version = import.meta.env.VITE_APP_VERSION || '0.0.0'

// Links from environment variables
const links = {
  terms: import.meta.env.VITE_TERMS_URL || 'https://u-finder.com/terms',
  privacy: import.meta.env.VITE_PRIVACY_URL || 'https://u-finder.com/privacy',
  license: import.meta.env.VITE_LICENSE_URL || 'https://github.com/u-finder/u-finder/blob/main/LICENSE',
}

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

function openLink(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
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
        <!-- Version Info -->
        <div class="flex items-center justify-between rounded-lg border p-4">
          <div class="space-y-0.5">
            <Label class="text-base font-medium">
              {{ t('settings.about.version') }}
            </Label>
            <p class="text-sm text-muted-foreground">
              v{{ version }}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Legal & Policies -->
    <Card>
      <CardHeader>
        <div class="flex items-center gap-2">
          <Scale class="size-5 text-muted-foreground" />
          <CardTitle>{{ t('settings.about.legalTitle') }}</CardTitle>
        </div>
      </CardHeader>
      <CardContent class="space-y-3">
        <!-- Terms of Service -->
        <button
          @click="openLink(links.terms)"
          class="flex w-full items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <div class="flex items-center gap-3">
            <div class="rounded-md bg-muted p-2">
              <FileText class="size-5 text-foreground" />
            </div>
            <div class="text-left space-y-0.5">
              <p class="text-base font-medium">
                {{ t('settings.about.terms') }}
              </p>
              <p class="text-sm text-muted-foreground">
                {{ t('settings.about.termsDesc') }}
              </p>
            </div>
          </div>
          <ExternalLink class="size-4 text-muted-foreground" />
        </button>

        <Separator />

        <!-- Privacy Policy -->
        <button
          @click="openLink(links.privacy)"
          class="flex w-full items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <div class="flex items-center gap-3">
            <div class="rounded-md bg-muted p-2">
              <Shield class="size-5 text-foreground" />
            </div>
            <div class="text-left space-y-0.5">
              <p class="text-base font-medium">
                {{ t('settings.about.privacy') }}
              </p>
              <p class="text-sm text-muted-foreground">
                {{ t('settings.about.privacyDesc') }}
              </p>
            </div>
          </div>
          <ExternalLink class="size-4 text-muted-foreground" />
        </button>

        <Separator />

        <!-- Open Source License -->
        <button
          @click="openLink(links.license)"
          class="flex w-full items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <div class="flex items-center gap-3">
            <div class="rounded-md bg-muted p-2">
              <Scale class="size-5 text-foreground" />
            </div>
            <div class="text-left space-y-0.5">
              <p class="text-base font-medium">
                {{ t('settings.about.license') }}
              </p>
              <p class="text-sm text-muted-foreground">
                {{ t('settings.about.licenseDesc') }}
              </p>
            </div>
          </div>
          <ExternalLink class="size-4 text-muted-foreground" />
        </button>
      </CardContent>
    </Card>

    <!-- Footer Note -->
    <div class="text-center text-sm text-muted-foreground">
      <p>{{ t('settings.about.footer') }}</p>
    </div>
  </div>
</template>
