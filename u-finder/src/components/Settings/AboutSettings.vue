<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { FileText, Shield, Scale, ExternalLink, Info } from 'lucide-vue-next'

const { t } = useI18n()

// Version info from environment variable
const version = import.meta.env.VITE_APP_VERSION || '0.0.0'

// Links from environment variables
const links = {
  terms: import.meta.env.VITE_TERMS_URL || 'https://u-finder.com/terms',
  privacy: import.meta.env.VITE_PRIVACY_URL || 'https://u-finder.com/privacy',
  license: import.meta.env.VITE_LICENSE_URL || 'https://github.com/u-finder/u-finder/blob/main/LICENSE',
}

function openLink(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <div class="space-y-6">
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
        <CardTitle>{{ t('settings.about.legalTitle') }}</CardTitle>
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
