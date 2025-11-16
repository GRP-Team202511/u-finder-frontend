<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

// Load saved language from localStorage on component mount
const savedLang = localStorage.getItem('preferred-language')
if (savedLang && ['en', 'zh-CN', 'zh-TW'].includes(savedLang)) {
  locale.value = savedLang as 'en' | 'zh-CN' | 'zh-TW'
}

const languages = [
  {
    code: 'en' as const,
    name: 'English'
  },
  {
    code: 'zh-CN' as const,
    name: '简体中文'
  },
  {
    code: 'zh-TW' as const,
    name: '繁體中文'
  }
]

const currentLocale = computed(() => locale.value)

const selectedLanguage = computed(() => {
  return languages.find(lang => lang.code === currentLocale.value)!
})

const switchLanguage = (value: any) => {
  if (typeof value === 'string' && ['en', 'zh-CN', 'zh-TW'].includes(value)) {
    locale.value = value as 'en' | 'zh-CN' | 'zh-TW'
    localStorage.setItem('preferred-language', value)
  }
}
</script>

<template>
  <Select :model-value="currentLocale" @update:model-value="switchLanguage">
    <SelectTrigger>
      <SelectValue>
        <div>
          <span>{{ selectedLanguage.name }}</span>
        </div>
      </SelectValue>
    </SelectTrigger>
    <SelectContent>
      <SelectItem v-for="lang in languages" :key="lang.code" :value="lang.code">
        {{ lang.name }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>