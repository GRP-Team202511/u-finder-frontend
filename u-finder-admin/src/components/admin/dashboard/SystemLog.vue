<template>
  <Card class="box-border rounded-[28px] border border-[#dddddd] bg-white p-5">
    <div class="mb-[14px] flex items-center justify-between">
      <h2 class="m-0 text-[22px] font-extrabold leading-[1.15] text-[#111111]">{{ t('dashboard.systemLogs.title') }}</h2>
      <span class="inline-flex items-center justify-center rounded-full border border-[#d8d8d8] bg-[#f7f7f7] px-[14px] py-[9px] text-xs font-bold text-[#111111]">{{ t('dashboard.systemLogs.badge') }}</span>
    </div>

    <div class="mb-[14px] grid gap-[14px] md:grid-cols-2">
      <div class="flex flex-col gap-[7px]">
        <label class="text-[13px] font-medium text-[#6b6b6b]">{{ t('dashboard.filters.date') }}</label>
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
        <label class="text-[13px] font-medium text-[#6b6b6b]">{{ t('dashboard.filters.level') }}</label>
        <Select :model-value="selectedLevel" @update:model-value="handleLevelChange">
          <SelectTrigger class="h-[42px] w-full min-w-0 rounded-[14px] border border-[#d5d5d5] bg-white px-[14px] text-[13px] text-[#111111]">
            <SelectValue>{{ selectedLevelLabel }}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{{ t('dashboard.systemLogs.levels.all') }}</SelectItem>
            <SelectItem value="INFO">{{ t('dashboard.systemLogs.levels.info') }}</SelectItem>
            <SelectItem value="WARN">{{ t('dashboard.systemLogs.levels.warn') }}</SelectItem>
            <SelectItem value="ERROR">{{ t('dashboard.systemLogs.levels.error') }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div class="overflow-hidden rounded-[18px] border border-[#dddddd] bg-white">
      <div v-if="props.logs.length === 0" class="px-[14px] py-[18px] text-[13px] text-[#6b6b6b]">
        {{ t('dashboard.systemLogs.empty') }}
      </div>

      <div
        v-for="(log, idx) in props.logs"
        :key="idx"
        class="grid items-center gap-3 border-b border-dashed border-[#d9d9d9] px-[14px] py-3 [grid-template-columns:92px_92px_1fr] last:border-b-0 max-[900px]:grid-cols-1 max-[900px]:gap-2"
      >
        <div class="text-[13px] text-[#222222]">{{ log.time }}</div>
        <div class="flex items-center">
          <span class="inline-flex min-w-[58px] items-center justify-center rounded-full border border-[#d7d7d7] bg-[#f7f7f7] px-2.5 py-[5px] text-xs text-[#222222]">{{ t(`dashboard.systemLogs.levels.${log.level.toLowerCase()}`) }}</span>
        </div>
        <div class="text-[13px] leading-[1.35] text-[#222222]">{{ log.message }}</div>
      </div>
    </div>

    <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2 text-xs text-[#666666]">
        <span>{{ t('dashboard.pagination.rowsPerPage') }}</span>
        <Select :model-value="String(rowsPerPage)" @update:model-value="handleRowsPerPageChange">
          <SelectTrigger class="h-[34px] min-w-16 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="text-xs text-[#666666]">
        {{ t('dashboard.pagination.pageOf', { page: currentPage, total: totalPages }) }}
      </div>

      <div class="flex items-center gap-1.5">
        <Button variant="secondary" size="sm" @click="prevPage" :disabled="currentPage === 1">
          ‹
        </Button>
        <Button
          variant="secondary"
          size="sm"
          @click="nextPage"
          :disabled="currentPage === totalPages || totalPages === 0"
        >
          ›
        </Button>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { parseDate } from '@internationalized/date'
import type { AcceptableValue } from 'reka-ui'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const { t } = useI18n()

export interface LogItem {
  date: string
  time: string
  level: 'INFO' | 'WARN' | 'ERROR'
  message: string
}

const LEVEL_TO_API: Record<string, string> = {
  ALL: 'all', INFO: 'info', WARN: 'warn', ERROR: 'error',
}

const props = defineProps<{
  logs: LogItem[]
  logsTotalCount: number
}>()

const emit = defineEmits<{
  (e: 'filter-change', params: {
    logs_date?: string
    logs_level?: string
    logs_page?: number
    logs_per_page?: number
  }): void
}>()

const today = new Date().toISOString().slice(0, 10)
const selectedDate = ref(today)
const selectedDateValue = ref<any>(parseDate(selectedDate.value))
const isDateMenuOpen = ref(false)
const selectedLevel = ref<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL')
const currentPage = ref(1)
const rowsPerPage = ref(10)

const selectedLevelLabel = computed(() => {
  if (selectedLevel.value === 'INFO') return t('dashboard.systemLogs.levels.info')
  if (selectedLevel.value === 'WARN') return t('dashboard.systemLogs.levels.warn')
  if (selectedLevel.value === 'ERROR') return t('dashboard.systemLogs.levels.error')
  return t('dashboard.systemLogs.levels.all')
})

const totalPages = computed(() =>
  props.logsTotalCount === 0 ? 0 : Math.ceil(props.logsTotalCount / rowsPerPage.value)
)

function handleCalendarChange(value: any) {
  if (!value) return
  selectedDateValue.value = value
  selectedDate.value = value.toString()
  isDateMenuOpen.value = false
  currentPage.value = 1
  emitFilters()
}

function handleLevelChange(value: AcceptableValue) {
  if (typeof value !== 'string') return
  if (!['ALL', 'INFO', 'WARN', 'ERROR'].includes(value)) return
  selectedLevel.value = value as typeof selectedLevel.value
  currentPage.value = 1
  emitFilters()
}

function handleRowsPerPageChange(value: AcceptableValue) {
  if (typeof value !== 'string') return
  const n = Number(value)
  if ([5, 10, 20].includes(n)) {
    rowsPerPage.value = n
    currentPage.value = 1
    emitFilters()
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    emitFilters()
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    emitFilters()
  }
}

function emitFilters() {
  emit('filter-change', {
    logs_date: selectedDate.value,
    logs_level: LEVEL_TO_API[selectedLevel.value] ?? 'all',
    logs_page: currentPage.value,
    logs_per_page: rowsPerPage.value,
  })
}
</script>