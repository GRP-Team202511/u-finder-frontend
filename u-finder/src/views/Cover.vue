<!-- This code was completed by GRP Team 2025.11. -->
<script setup lang="ts">
import AuthTopNav from '@/components/auth/AuthTopNav.vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { useRouter } from 'vue-router'


const { t } = useI18n()
const router = useRouter()

function goSignup() {
  router.push({ name: 'Signup' })
}
function goLogin() {
  router.push({ name: 'Login' })
}
</script>

<template>
  <div class="min-h-dvh flex flex-col">
    <AuthTopNav />
    <main class="flex flex-1 items-center justify-center px-4 py-6 sm:px-6">
      <div class="text-center max-w-2xl">
        <h1 class="mb-4 text-3xl font-bold drop-shadow-lg sm:text-4xl md:text-6xl">
          {{ t('cover.title') }}
        </h1>
        <p class="mb-8 text-base opacity-90 sm:text-lg md:text-xl">
          {{ t('cover.description') }}
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="default" size="lg" @click="goLogin">
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