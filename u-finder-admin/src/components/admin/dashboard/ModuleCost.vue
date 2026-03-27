<template>
  <Card class="box-border rounded-[28px] border border-[#dddddd] dark:border-border bg-white dark:bg-card p-5">
    <div class="mb-[18px] flex items-center justify-between">
      <h2 class="m-0 text-[22px] font-extrabold leading-[1.15] text-[#111111] dark:text-foreground">{{ t('dashboard.modelCost.title') }}</h2>
      <span class="inline-flex items-center justify-center rounded-full border border-[#d8d8d8] dark:border-border bg-[#f7f7f7] dark:bg-muted px-[14px] py-[9px] text-xs font-bold text-[#111111] dark:text-foreground">{{ t('dashboard.modelCost.badge') }}</span>
    </div>

    <div class="mb-[14px] grid gap-[14px] md:grid-cols-2">
      <div class="flex flex-col gap-[7px]">
        <label class="text-[13px] font-medium text-[#6b6b6b] dark:text-muted-foreground">{{ t('dashboard.filters.model') }}</label>
        <Select :model-value="selectedModel" @update:model-value="handleModelChange">
          <SelectTrigger class="h-[42px] w-full min-w-0 text-[13px]">
            <SelectValue>{{ selectedModelLabel }}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="chat">{{ t('dashboard.modelCost.models.chat') }}</SelectItem>
            <SelectItem value="cv_parsing">{{ t('dashboard.modelCost.models.cvParsing') }}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex flex-col gap-[7px]">
        <label class="text-[13px] font-medium text-[#6b6b6b] dark:text-muted-foreground">{{ t('dashboard.filters.timeRange') }}</label>
        <Select :model-value="selectedRange" @update:model-value="handleRangeChange">
          <SelectTrigger class="h-[42px] w-full min-w-0 text-[13px]">
            <SelectValue>{{ selectedRangeLabel }}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last_24h">{{ t('dashboard.modelCost.timeRanges.last24h') }}</SelectItem>
            <SelectItem value="last_7d">{{ t('dashboard.modelCost.timeRanges.last7d') }}</SelectItem>
            <SelectItem value="last_1m">{{ t('dashboard.modelCost.timeRanges.last30d') }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div class="mb-[14px] grid gap-[14px] md:grid-cols-2">
      <div class="box-border min-h-[112px] rounded-[18px] border border-[#dddddd] dark:border-border p-[18px]">
        <div class="mb-2 text-[13px] text-[#6b6b6b] dark:text-muted-foreground">{{ t('dashboard.modelCost.totalRequests') }}</div>
        <div class="mb-2 text-[28px] font-extrabold leading-[1.05] text-[#111111] dark:text-foreground">{{ formattedRequests }}</div>
        <div class="text-xs leading-[1.35] text-[#6b6b6b] dark:text-muted-foreground">{{ t('dashboard.modelCost.avgLatency') }}: {{ props.modelCost?.avgLatency ?? '0s' }}</div>
      </div>

      <div class="box-border min-h-[112px] rounded-[18px] border border-[#dddddd] dark:border-border p-[18px]">
        <div class="mb-2 text-[13px] text-[#6b6b6b] dark:text-muted-foreground">{{ t('dashboard.modelCost.estimatedCost') }}</div>
        <div class="mb-2 text-[28px] font-extrabold leading-[1.05] text-[#111111] dark:text-foreground">{{ formattedCost }}</div>
        <div class="text-xs leading-[1.35] text-[#6b6b6b] dark:text-muted-foreground">{{ t('dashboard.modelCost.tokens') }}: {{ props.modelCost?.tokens ?? '0' }}</div>
      </div>
    </div>

  </Card>
</template>

<script setup lang="ts">
import type { AcceptableValue } from 'reka-ui'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const { t } = useI18n()

export interface ModelCostData {
  selectedModel: string
  selectedRange: string
  totalRequests: number
  avgLatency: string
  estimatedCost: number
  tokens: string
}

const props = defineProps<{
  modelCost?: ModelCostData
}>()

const emit = defineEmits<{
  (e: 'filter-change', params: { cost_model?: string; cost_time_range?: string }): void
}>()

const selectedModel = ref('chat')
const selectedRange = ref('last_24h')

const selectedModelLabel = computed(() => {
  if (selectedModel.value === 'cv_parsing') return t('dashboard.modelCost.models.cvParsing')
  return t('dashboard.modelCost.models.chat')
})

const selectedRangeLabel = computed(() => {
  if (selectedRange.value === 'last_7d') return t('dashboard.modelCost.timeRanges.last7d')
  if (selectedRange.value === 'last_1m') return t('dashboard.modelCost.timeRanges.last30d')
  return t('dashboard.modelCost.timeRanges.last24h')
})

const formattedRequests = computed(() => {
  const total = props.modelCost?.totalRequests ?? 0
  return total.toLocaleString()
})

const formattedCost = computed(() => {
  const cost = props.modelCost?.estimatedCost ?? 0
  return `$${cost.toFixed(2)}`
})

function handleModelChange(value: AcceptableValue) {
  if (typeof value !== 'string') return
  selectedModel.value = value
  emitFilters()
}

function handleRangeChange(value: AcceptableValue) {
  if (typeof value !== 'string') return
  selectedRange.value = value
  emitFilters()
}

function emitFilters() {
  emit('filter-change', {
    cost_model: selectedModel.value,
    cost_time_range: selectedRange.value,
  })
}
</script>