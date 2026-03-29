<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
const LOAD_TIMEOUT_MS = 10_000

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
  }
}

const props = withDefaults(defineProps<{
  siteKey?: string
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'compact'
}>(), {
  siteKey: import.meta.env.VITE_TURNSTILE_SITE_KEY ?? '',
  theme: 'auto',
  size: 'normal',
})

const emit = defineEmits<{
  (e: 'verify', token: string): void
  (e: 'expire'): void
  (e: 'error'): void
}>()

const container = ref<HTMLElement>()
let widgetId: string | undefined
let timeoutId: ReturnType<typeof setTimeout> | undefined

const renderWidget = () => {
  if (!window.turnstile || !container.value) return
  widgetId = window.turnstile.render(container.value, {
    sitekey: props.siteKey,
    theme: props.theme,
    size: props.size,
    callback: (token: string) => emit('verify', token),
    'expired-callback': () => emit('expire'),
    'error-callback': () => emit('error'),
  })
}

function loadTurnstileScript(): Promise<void> {
  const existing = document.querySelector<HTMLScriptElement>(`script[src^="${TURNSTILE_SCRIPT_URL}"]`)
  if (existing) {
    return window.turnstile
      ? Promise.resolve()
      : new Promise((resolve, reject) => {
          existing.addEventListener('load', () => resolve(), { once: true })
          existing.addEventListener('error', () => reject(new Error('Turnstile script failed to load')), { once: true })
          timeoutId = setTimeout(() => reject(new Error('Turnstile script load timed out')), LOAD_TIMEOUT_MS)
        })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = TURNSTILE_SCRIPT_URL
    script.async = true
    script.addEventListener('load', () => resolve(), { once: true })
    script.addEventListener('error', () => reject(new Error('Turnstile script failed to load')), { once: true })
    timeoutId = setTimeout(() => reject(new Error('Turnstile script load timed out')), LOAD_TIMEOUT_MS)
    document.head.appendChild(script)
  })
}

onMounted(async () => {
  if (!props.siteKey) return

  if (window.turnstile) {
    renderWidget()
    return
  }

  try {
    await loadTurnstileScript()
    renderWidget()
  } catch {
    emit('error')
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = undefined
    }
  }
})

onUnmounted(() => {
  if (timeoutId) clearTimeout(timeoutId)
  if (widgetId !== undefined && window.turnstile) {
    window.turnstile.remove(widgetId)
  }
})

const reset = () => {
  if (widgetId !== undefined && window.turnstile) {
    window.turnstile.reset(widgetId)
  }
}

defineExpose({ reset })
</script>

<template>
  <div v-if="siteKey" ref="container" />
</template>
