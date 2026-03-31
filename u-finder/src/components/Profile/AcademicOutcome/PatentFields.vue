<!-- This code was completed by GRP Team 2025.11. -->
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type PatentEntry = {
  title?: string
  patentNumber?: string
  region?: string
  description?: string
}

const props = defineProps<{
  entry: PatentEntry
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
      <FieldLabel :for="`patent-title-${props.index}`">
        {{ t('academic.patent.title') }}
        <span v-if="props.editable" class="text-red-500">*</span>
      </FieldLabel>
      <Input
        v-if="props.editable"
        :id="`patent-title-${props.index}`"
        v-model="props.entry.title"
        :placeholder="t('academic.patent.titlePlaceholder')"
        :class="cn(props.hasTitleError && 'border-red-500')"
        @input="emit('clearTitleError')"
      />
      <div v-else class="text-sm text-left">{{ props.entry.title || '-' }}</div>
    </Field>

    <Field>
      <FieldLabel :for="`patent-number-${props.index}`">{{ t('academic.patent.number') }}</FieldLabel>
      <Input
        v-if="props.editable"
        :id="`patent-number-${props.index}`"
        v-model="props.entry.patentNumber"
        :placeholder="t('academic.patent.numberPlaceholder')"
      />
      <div v-else class="text-sm text-left">{{ props.entry.patentNumber || '-' }}</div>
    </Field>

    <Field>
      <FieldLabel :for="`patent-region-${props.index}`">{{ t('academic.patent.region') }}</FieldLabel>
      <Input
        v-if="props.editable"
        :id="`patent-region-${props.index}`"
        v-model="props.entry.region"
        :placeholder="t('academic.patent.regionPlaceholder')"
      />
      <div v-else class="text-sm text-left">{{ props.entry.region || '-' }}</div>
    </Field>

    <Field>
      <FieldLabel :for="`patent-description-${props.index}`">{{ t('academic.patent.description') }}</FieldLabel>
      <textarea
        v-if="props.editable"
        :id="`patent-description-${props.index}`"
        v-model="props.entry.description"
        :placeholder="t('academic.patent.descriptionPlaceholder')"
        rows="6"
        class="w-full rounded-md border px-3 py-2 text-sm"
      ></textarea>
      <div v-else class="text-sm text-left whitespace-pre-wrap break-words">{{ props.entry.description || '-' }}</div>
    </Field>
  </div>
</template>
