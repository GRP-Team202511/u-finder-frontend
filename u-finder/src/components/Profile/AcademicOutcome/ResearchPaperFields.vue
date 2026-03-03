<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type ResearchPaperEntry = {
  title?: string
  doi?: string
  abstract?: string
}

const props = defineProps<{
  entry: ResearchPaperEntry
  index: number
  editable: boolean
}>()

const { t } = useI18n()
</script>

<template>
  <div class="grid gap-4">
    <Field>
      <FieldLabel :for="`paper-title-${props.index}`">{{ t('academic.researchPaper.title') || 'Title' }}</FieldLabel>
      <Input
        v-if="props.editable"
        :id="`paper-title-${props.index}`"
        v-model="props.entry.title"
        :placeholder="t('academic.researchPaper.titlePlaceholder') || 'Paper title'"
      />
      <div v-else class="text-sm text-left">{{ props.entry.title || '-' }}</div>
    </Field>

    <Field>
      <FieldLabel :for="`paper-doi-${props.index}`">{{ t('academic.researchPaper.doi') || 'DOI' }}</FieldLabel>
      <Input
        v-if="props.editable"
        :id="`paper-doi-${props.index}`"
        v-model="props.entry.doi"
        :placeholder="t('academic.researchPaper.doiPlaceholder') || 'DOI'"
      />
      <div v-else class="text-sm text-left">{{ props.entry.doi || '-' }}</div>
    </Field>

    <Field>
      <FieldLabel :for="`paper-abstract-${props.index}`">{{ t('academic.researchPaper.abstract') || 'Abstract' }}</FieldLabel>
      <textarea
        v-if="props.editable"
        :id="`paper-abstract-${props.index}`"
        v-model="props.entry.abstract"
        :placeholder="t('academic.researchPaper.abstractPlaceholder') || 'Abstract'"
        rows="6"
        class="w-full rounded-md border px-3 py-2 text-sm"
      ></textarea>
      <div v-else class="text-sm text-left whitespace-pre-wrap break-words">{{ props.entry.abstract || '-' }}</div>
    </Field>
  </div>
</template>
