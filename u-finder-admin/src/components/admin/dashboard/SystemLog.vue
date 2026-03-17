<template>
  <Card class="box-border rounded-[28px] border border-[#dddddd] bg-white p-5">
    <div class="mb-[14px] flex items-center justify-between">
      <h2 class="m-0 text-[22px] font-extrabold leading-[1.15] text-[#111111]">System Logs Preview</h2>
      <span class="inline-flex items-center justify-center rounded-full border border-[#d8d8d8] bg-[#f7f7f7] px-[14px] py-[9px] text-xs font-bold text-[#111111]">Live</span>
    </div>

    <div class="mb-[14px] grid gap-[14px] md:grid-cols-2">
      <div class="flex flex-col gap-[7px]">
        <label class="text-[13px] font-medium text-[#6b6b6b]">Date</label>
        <DropdownMenu v-model:open="isDateMenuOpen">
          <DropdownMenuTrigger as-child>
            <Button variant="outline" class="h-[42px] w-full min-w-0 justify-start rounded-[14px] border border-[#d5d5d5] bg-white px-[14px] text-[13px] text-[#111111]">
              {{ selectedDate }}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" class="w-auto p-0">
            <Calendar :model-value="selectedDateValue" @update:model-value="handleCalendarChange" />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div class="flex flex-col gap-[7px]">
        <label class="text-[13px] font-medium text-[#6b6b6b]">Level</label>
        <Select :model-value="selectedLevel" @update:model-value="handleLevelChange">
          <SelectTrigger class="h-[42px] w-full min-w-0 rounded-[14px] border border-[#d5d5d5] bg-white px-[14px] text-[13px] text-[#111111]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INFO">INFO</SelectItem>
            <SelectItem value="WARN">WARN</SelectItem>
            <SelectItem value="ERROR">ERROR</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div class="overflow-hidden rounded-[18px] border border-[#dddddd] bg-white">
      <div v-if="filteredLogs.length === 0" class="px-[14px] py-[18px] text-[13px] text-[#6b6b6b]">
        No logs found.
      </div>

      <div
        v-for="log in filteredLogs"
        :key="log.date + log.time + log.message"
        class="grid items-center gap-3 border-b border-dashed border-[#d9d9d9] px-[14px] py-3 [grid-template-columns:92px_92px_1fr] last:border-b-0 max-[900px]:grid-cols-1 max-[900px]:gap-2"
      >
        <div class="text-[13px] text-[#222222]">{{ log.time }}</div>
        <div class="flex items-center">
          <span class="inline-flex min-w-[58px] items-center justify-center rounded-full border border-[#d7d7d7] bg-[#f7f7f7] px-2.5 py-[5px] text-xs text-[#222222]">{{ log.level }}</span>
        </div>
        <div class="text-[13px] leading-[1.35] text-[#222222]">{{ log.message }}</div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { parseDate } from '@internationalized/date'
import type { AcceptableValue } from 'reka-ui'
import { computed, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface LogItem {
  date: string
  time: string
  level: 'INFO' | 'WARN' | 'ERROR'
  message: string
}

const props = defineProps<{
  logs: LogItem[]
}>()

const selectedDate = ref('2026-03-15')
const selectedDateValue = ref<any>(parseDate(selectedDate.value))
const isDateMenuOpen = ref(false)
const selectedLevel = ref<'INFO' | 'WARN' | 'ERROR'>('INFO')

const filteredLogs = computed(() => {
  return props.logs.filter((log) => {
    return log.date === selectedDate.value && log.level === selectedLevel.value
  })
})

function handleCalendarChange(value: any) {
  if (!value) return
  selectedDateValue.value = value
  selectedDate.value = value.toString()
  isDateMenuOpen.value = false
}

function handleLevelChange(value: AcceptableValue) {
  if (typeof value !== 'string') return
  if (value !== 'INFO' && value !== 'WARN' && value !== 'ERROR') return
  selectedLevel.value = value
}

watch(
  () => props.logs,
  (next) => {
    const firstLog = next[0]
    if (!firstLog) return

    const hasSelectedDate = next.some((log) => log.date === selectedDate.value)
    if (!hasSelectedDate) {
      selectedDate.value = firstLog.date
      selectedDateValue.value = parseDate(firstLog.date)
    }
  },
  { immediate: true }
)
</script>