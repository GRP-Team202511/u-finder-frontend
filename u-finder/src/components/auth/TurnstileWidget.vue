<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

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
let pollTimer: ReturnType<typeof setInterval> | undefined

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

onMounted(() => {
  if (!props.siteKey) return

  if (window.turnstile) {
    renderWidget()
  } else {
    pollTimer = setInterval(() => {
      if (window.turnstile) {
        clearInterval(pollTimer!)
        pollTimer = undefined
        renderWidget()
      }
    }, 100)
  }
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
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
