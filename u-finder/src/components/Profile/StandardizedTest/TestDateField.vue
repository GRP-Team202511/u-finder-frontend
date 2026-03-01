<script setup lang="ts">
import { ref, watch } from 'vue'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon } from 'lucide-vue-next'
import { DateFormatter, getLocalTimeZone, today } from '@internationalized/date'

const props = defineProps<{
  modelValue?: string
  index: number
  editable: boolean
  idBase: string
  label?: string
  mode?: 'date' | 'month'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', payload: string): void
}>()

const dateValue = ref<any>(undefined)
const df = new DateFormatter('en-US', { dateStyle: 'medium' })
const dfMonth = new DateFormatter('en-US', { month: 'long', year: 'numeric' })
const defaultPlaceholder = today(getLocalTimeZone())
const maxValue = defaultPlaceholder

async function createDateValueFromYYYYMM(yyyyMm: string) {
  if (!yyyyMm) return undefined
  const parts = yyyyMm.split('-')
  if (parts.length < 1) return undefined
  const [p0 = '', p1 = '', p2 = ''] = parts
  const y = parseInt(p0, 10)
  const m = p1 ? parseInt(p1, 10) : 1
  const d = p2 ? parseInt(p2, 10) : 1
  if (!isFinite(y) || !isFinite(m) || !isFinite(d)) return undefined
  try {
    const mod = await import('@internationalized/date')
    const anyMod = mod as any
    if (anyMod.CalendarDate) {
      try {
        return new anyMod.CalendarDate(y, m, d)
      } catch (err) {
        // ignore and try other factories
      }
    }
    if (anyMod.createCalendarDate) {
      try {
        return anyMod.createCalendarDate(y, m, d)
      } catch (err) {
        // ignore
      }
    }
    if (anyMod.createCalendar) {
      try {
        const iso = `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T00:00:00`
        if (anyMod.ZonedDateTime && anyMod.ZonedDateTime.from) {
          return anyMod.ZonedDateTime.from(iso)
        }
      } catch (err) {
        // ignore
      }
    }
  } catch (e) {
    // dynamic import failed; will fall back to shim
  }
  return {
    toDate: (_tz?: string) => new Date(y, m - 1, d),
  }
}

function formatToDate(dv: any, tz: string) {
  if (!dv) return ''
  let dt: Date
  if (typeof dv.toDate === 'function') dt = dv.toDate(tz)
  else dt = new Date(dv)
  const m = dt.getMonth() + 1
  const d = dt.getDate()
  return `${dt.getFullYear()}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`
}

function formatToMonth(dv: any, tz: string) {
  if (!dv) return ''
  let dt: Date
  if (typeof dv.toDate === 'function') dt = dv.toDate(tz)
  else dt = new Date(dv)
  const m = dt.getMonth() + 1
  return `${dt.getFullYear()}-${m.toString().padStart(2, '0')}`
}

async function initDate() {
  dateValue.value = await createDateValueFromYYYYMM(props.modelValue || '')
}

watch(
  () => props.modelValue,
  async () => {
    await initDate()
  },
  { immediate: true }
)

function handleUpdate(dv: any, close?: () => void) {
  dateValue.value = dv
  const tz = getLocalTimeZone()
  const formatted = dv
    ? (props.mode === 'month' ? formatToMonth(dv, tz) : formatToDate(dv, tz))
    : ''
  emit('update:modelValue', formatted)
  if (close) close()
}
</script>

<template>
  <Field>
    <FieldLabel :for="`${props.idBase}-${props.index}`">{{ props.label || 'Test date' }}</FieldLabel>
    <div v-if="props.editable">
      <Popover v-slot="{ close }">
        <PopoverTrigger as-child>
          <Button variant="outline" :class="cn('w-full justify-start text-left font-normal', !props.modelValue && 'text-muted-foreground')">
            <CalendarIcon class="mr-2 h-4 w-4" />
            {{ dateValue ? (props.mode === 'month' ? dfMonth.format(dateValue!.toDate(getLocalTimeZone())) : df.format(dateValue!.toDate(getLocalTimeZone()))) : (props.modelValue || 'Pick date') }}
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-auto p-0" align="start">
          <Calendar
            v-model="dateValue"
            :default-placeholder="defaultPlaceholder"
            :max-value="maxValue"
            layout="month-and-year"
            initial-focus
            @update:model-value="(val) => handleUpdate(val, close)"
          />
        </PopoverContent>
      </Popover>
    </div>
    <div v-else class="text-sm text-left">
      {{ dateValue ? (props.mode === 'month' ? dfMonth.format(dateValue!.toDate(getLocalTimeZone())) : df.format(dateValue!.toDate(getLocalTimeZone()))) : (props.modelValue || '-') }}
    </div>
  </Field>
</template>
