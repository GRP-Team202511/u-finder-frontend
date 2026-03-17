<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type ResearchPaperEntry = {
  title?: string
  doi?: string
  abstract?: string
}

const props = defineProps<{
  entry: ResearchPaperEntry
  index: number
  editable: boolean
  hasTitleError?: boolean
}>()

const emit = defineEmits<{
  (e: 'clearTitleError'): void
}>()

const { t } = useI18n()
</script>

<template>
  <div class="grid gap-4">
    <Field>
      <FieldLabel :for="`paper-title-${props.index}`">
        {{ t('academic.researchPaper.title') }}
        <span v-if="props.editable" class="text-red-500">*</span>
      </FieldLabel>
      <Input
        v-if="props.editable"
        :id="`paper-title-${props.index}`"
        v-model="props.entry.title"
        :placeholder="t('academic.researchPaper.titlePlaceholder')"
        :class="cn(props.hasTitleError && 'border-red-500')"
        @input="emit('clearTitleError')"
      />
      <div v-else class="text-sm text-left">{{ props.entry.title || '-' }}</div>
    </Field>

    <Field>
      <FieldLabel :for="`paper-doi-${props.index}`">{{ t('academic.researchPaper.doi') }}</FieldLabel>
      <Input
        v-if="props.editable"
        :id="`paper-doi-${props.index}`"
        v-model="props.entry.doi"
        :placeholder="t('academic.researchPaper.doiPlaceholder')"
      />
      <div v-else class="text-sm text-left">{{ props.entry.doi || '-' }}</div>
    </Field>

    <Field>
      <FieldLabel :for="`paper-abstract-${props.index}`">{{ t('academic.researchPaper.abstract') }}</FieldLabel>
      <textarea
        v-if="props.editable"
        :id="`paper-abstract-${props.index}`"
        v-model="props.entry.abstract"
        :placeholder="t('academic.researchPaper.abstractPlaceholder')"
        rows="6"
        class="w-full rounded-md border px-3 py-2 text-sm"
      ></textarea>
      <div v-else class="text-sm text-left whitespace-pre-wrap break-words">{{ props.entry.abstract || '-' }}</div>
    </Field>
  </div>
</template>
