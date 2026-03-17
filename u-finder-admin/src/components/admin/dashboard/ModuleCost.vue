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
            <SelectItem value="gpt-4.1-mini">gpt-4.1-mini</SelectItem>
            <SelectItem value="gpt-4.1">gpt-4.1</SelectItem>
            <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
            <SelectItem value="chat">chat</SelectItem>
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
            <SelectItem value="24 hours">24 hours</SelectItem>
            <SelectItem value="7 days">7 days</SelectItem>
            <SelectItem value="30 days">30 days</SelectItem>
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

    <div class="flex flex-wrap gap-[10px]">
      <Button variant="outline" size="default" class="text-[13px] font-bold">Download</Button>
      <Button variant="default" size="default" class="text-[13px] font-bold">Set Alert</Button>
    </div>
  </Card>
</template>

<script setup lang="ts">
import type { AcceptableValue } from 'reka-ui'
import { computed, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
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

const selectedModel = ref(props.modelCost?.selectedModel ?? 'gpt-4.1-mini')
const selectedRange = ref(props.modelCost?.selectedRange ?? '24 hours')

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
}

function handleRangeChange(value: AcceptableValue) {
  if (typeof value !== 'string') return
  selectedRange.value = value
}

watch(
  () => props.modelCost,
  (next) => {
    selectedModel.value = next?.selectedModel ?? 'gpt-4.1-mini'
    selectedRange.value = next?.selectedRange ?? '24 hours'
  },
  { immediate: true }
)
</script>