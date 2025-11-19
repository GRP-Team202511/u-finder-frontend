<script setup lang="ts">
import LanguageSelector from '@/components/LanguageSelector.vue';
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button';
import { useRouter } from 'vue-router';

const { t } = useI18n()
const router = useRouter()

function goSignup() {
  router.push({ name: 'Signup' })
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header class="p-4 md:px-8 flex justify-end">
      <LanguageSelector />
    </header>
    <main class="flex-1 flex items-center justify-center p-8">
      <div class="text-center max-w-2xl">
        <h1 class="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
          {{ t('cover.title') }}
        </h1>
        <p class="text-lg md:text-xl mb-8 opacity-90">
          {{ t('cover.description') }}
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="default" size="lg">
            {{ t('cover.login') }}
          </Button>
          <Button variant="outline" size="lg" @click="goSignup">
            {{ t('cover.signup') }}
          </Button>
        </div>
      </div>
    </main>
  </div>
</template>