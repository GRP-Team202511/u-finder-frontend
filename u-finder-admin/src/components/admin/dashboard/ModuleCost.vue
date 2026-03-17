<template>
  <Card class="box-border rounded-[28px] border border-[#dddddd] bg-white p-5">
    <div class="mb-[18px] flex items-center justify-between">
      <h2 class="m-0 text-[22px] font-extrabold leading-[1.15] text-[#111111]">Model Cost Snapshot</h2>
      <span class="inline-flex items-center justify-center rounded-full border border-[#d8d8d8] bg-[#f7f7f7] px-[14px] py-[9px] text-xs font-bold text-[#111111]">Today</span>
    </div>

    <div class="mb-[14px] grid gap-[14px] md:grid-cols-2">
      <div class="flex flex-col gap-[7px]">
        <label class="text-[13px] font-medium text-[#6b6b6b]">Model</label>
        <Select :model-value="selectedModel" @update:model-value="handleModelChange">
          <SelectTrigger class="h-[42px] w-full min-w-0 text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="chat">Chat</SelectItem>
            <SelectItem value="cv_parsing">CV Parsing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex flex-col gap-[7px]">
        <label class="text-[13px] font-medium text-[#6b6b6b]">Time Range</label>
        <Select :model-value="selectedRange" @update:model-value="handleRangeChange">
          <SelectTrigger class="h-[42px] w-full min-w-0 text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last_24h">24 hours</SelectItem>
            <SelectItem value="last_7d">7 days</SelectItem>
            <SelectItem value="last_1m">30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div class="mb-[14px] grid gap-[14px] md:grid-cols-2">
      <div class="box-border min-h-[112px] rounded-[18px] border border-[#dddddd] p-[18px]">
        <div class="mb-2 text-[13px] text-[#6b6b6b]">Total Requests</div>
        <div class="mb-2 text-[28px] font-extrabold leading-[1.05] text-[#111111]">{{ formattedRequests }}</div>
        <div class="text-xs leading-[1.35] text-[#6b6b6b]">avg latency: {{ props.modelCost?.avgLatency ?? '0s' }}</div>
      </div>

      <div class="box-border min-h-[112px] rounded-[18px] border border-[#dddddd] p-[18px]">
        <div class="mb-2 text-[13px] text-[#6b6b6b]">Estimated Cost</div>
        <div class="mb-2 text-[28px] font-extrabold leading-[1.05] text-[#111111]">{{ formattedCost }}</div>
        <div class="text-xs leading-[1.35] text-[#6b6b6b]">tokens: {{ props.modelCost?.tokens ?? '0' }}</div>
      </div>
    </div>

  </Card>
</template>

<script setup lang="ts">
import type { AcceptableValue } from 'reka-ui'
import { computed, ref } from 'vue'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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