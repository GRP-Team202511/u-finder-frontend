<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSelector from '@/components/LanguageSelector.vue'

type AuthNavName = 'Cover' | 'Login' | 'Signup'

const props = withDefaults(defineProps<{
  activeOverride?: AuthNavName | 'none' | 'auto'
}>(), {
  activeOverride: 'auto',
})

const emit = defineEmits<{
  (event: 'navigate', target: AuthNavName): void
}>()

const route = useRoute()
const { t } = useI18n()

const activeName = computed(() => {
  if (props.activeOverride === 'none') return null
  if (props.activeOverride !== 'auto') return props.activeOverride
  return route.name as AuthNavName | null
})

const navItems = computed(() => [
  { name: 'Cover', label: t('cover.home') },
  { name: 'Login', label: t('cover.login') },
  { name: 'Signup', label: t('cover.signup') },
])

function handleNavClick(target: AuthNavName) {
  emit('navigate', target)
}
</script>

<template>
  <header class="w-full border-b border-border/40 bg-background/75 backdrop-blur supports-[backdrop-filter]:bg-background/55">
    <div class="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-3 py-3 sm:px-4">
      <nav class="flex min-w-0 flex-wrap items-center gap-1.5" aria-label="Auth navigation">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="{ name: item.name }"
          @click.exact="handleNavClick(item.name as AuthNavName)"
          :class="[
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            activeName === item.name
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          ]"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
      <div class="w-[8.25rem] shrink-0">
        <LanguageSelector />
      </div>
    </div>
  </header>
</template>
