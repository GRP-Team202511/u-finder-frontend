<template>
  <Card class="panel">
    <div class="panel__header">
      <h2 class="panel__title">System Logs Preview</h2>
      <span class="pill-tag">Live</span>
    </div>

    <div class="filters">
      <div class="filter-field">
        <label class="filter-label">Date</label>
        <DropdownMenu v-model:open="isDateMenuOpen">
          <DropdownMenuTrigger as-child>
            <Button variant="outline" class="filter-input date-trigger">
              {{ selectedDate }}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" class="date-menu p-0">
            <Calendar :model-value="selectedDateValue" @update:model-value="handleCalendarChange" />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div class="filter-field">
        <label class="filter-label">Level</label>
        <Select :model-value="selectedLevel" @update:model-value="handleLevelChange">
          <SelectTrigger class="filter-input">
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

    <div class="logs-box">
      <div v-if="filteredLogs.length === 0" class="empty-state">
        No logs found.
      </div>

      <div
        v-for="log in filteredLogs"
        :key="log.date + log.time + log.message"
        class="log-row"
      >
        <div class="log-time">{{ log.time }}</div>
        <div class="log-level-wrap">
          <span class="level-pill">{{ log.level }}</span>
        </div>
        <div class="log-message">{{ log.message }}</div>
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

<style scoped>
.panel {
  background: #ffffff;
  border: 1px solid #dddddd;
  border-radius: 28px;
  padding: 20px;
  box-sizing: border-box;
}

.panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.panel__title {
  margin: 0;
  font-size: 22px;
  line-height: 1.15;
  font-weight: 800;
  color: #111111;
}

.pill-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 9px 14px;
  border-radius: 999px;
  border: 1px solid #d8d8d8;
  background: #f7f7f7;
  font-size: 12px;
  font-weight: 700;
  color: #111111;
}

.filters {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 14px;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.filter-label {
  font-size: 13px;
  color: #6b6b6b;
  font-weight: 500;
}

.filter-input {
  width: 100%;
  height: 42px;
  min-width: 0;
  font-size: 13px;
  box-sizing: border-box;
  border: 1px solid #d5d5d5;
  background: #ffffff;
  border-radius: 14px;
  padding: 0 14px;
  color: #111111;
  outline: none;
}

.date-trigger {
  justify-content: flex-start;
}

.date-menu {
  width: auto;
}

.logs-box {
  border: 1px solid #dddddd;
  border-radius: 18px;
  overflow: hidden;
  background: #ffffff;
}

.log-row {
  display: grid;
  grid-template-columns: 92px 92px 1fr;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px dashed #d9d9d9;
}

.log-row:last-child {
  border-bottom: none;
}

.log-time {
  font-size: 13px;
  color: #222222;
}

.log-level-wrap {
  display: flex;
  align-items: center;
}

.level-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 58px;
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid #d7d7d7;
  background: #f7f7f7;
  font-size: 12px;
  color: #222222;
}

.log-message {
  font-size: 13px;
  color: #222222;
  line-height: 1.35;
}

.empty-state {
  padding: 18px 14px;
  font-size: 13px;
  color: #6b6b6b;
}

@media (max-width: 900px) {
  .filters {
    grid-template-columns: 1fr;
  }

  .log-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
</style>