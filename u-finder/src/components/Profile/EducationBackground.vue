<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn, isBlankValue } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useI18n } from 'vue-i18n'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-vue-next'
import { ref, reactive, inject, onBeforeUnmount, onMounted } from 'vue'
import type { Ref } from 'vue'
import { Calendar } from '@/components/ui/calendar'
// (calendar value type will be treated as any to match calendar implementation)
import { DateFormatter, getLocalTimeZone, today } from '@internationalized/date'
import { toast } from 'vue-sonner'
// helper: create a DateValue-like object from YYYY-MM or YYYY-MM-DD using the library if available,
// otherwise return a shim with `toDate(tz)` so the calendar can consume it.
async function createDateValueFromYYYYMM(yyyyMm: string) {
  if (!yyyyMm) return undefined
  const parts = yyyyMm.split('-')
  if (parts.length < 2) return undefined
  const [p0 = '', p1 = '', p2 = ''] = parts
  const y = parseInt(p0, 10)
  const m = parseInt(p1, 10)
  const d = p2 ? parseInt(p2, 10) : 1
  if (!isFinite(y) || !isFinite(m) || !isFinite(d)) return undefined
  try {
    const mod = await import('@internationalized/date')
    const anyMod = mod as any
    // try common constructors in the library (access as any to avoid TS complaints)
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
      // fallback: try to create from ISO string if helper exists
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
  // fallback shim: object with toDate(tz)
  return {
    toDate: (_tz?: string) => new Date(y, m - 1, d),
  }
}

type EducationEntry = {
  type: string
  name: string
  time: { start: string; end: string }
  major: string
  ranking: string
  GPA: string
  GPA_base: string
}

const { t } = useI18n()

const props = defineProps<{
  class?: HTMLAttributes["class"]
  modelValue?: EducationEntry[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', payload: EducationEntry[]): void
  (e: 'save', payload: EducationEntry[]): void
  (e: 'cancel'): void
  (e: 'request-edit'): void
  (e: 'edit-complete'): void
}>()

// participate in global profile edit/save/cancel via optional provided API
type ProfileEditor = {
  register: (h: { save: () => void; cancel?: () => void }) => () => void
}
const profileEditor = inject<ProfileEditor | null>('profileEditor', null)

// local edit state
const localEditing = ref(false)
const pendingSave = ref(false)

// local draft state used while editing
const education: Ref<EducationEntry[]> = ref(props.modelValue ? JSON.parse(JSON.stringify(props.modelValue)) : [
  {
    type: '',
    name: '',
    time: { start: '', end: '' },
    major: '',
    ranking: '',
    GPA: '',
    GPA_base: ''
  }
])

// per-entry calendar values for calendar v-models (use `any` to match calendar implementation)
const startDates = reactive<any[]>(education.value.map(() => undefined))
const endDates = reactive<any[]>(education.value.map(() => undefined))

// validation error tracking for each entry
const validationErrors = reactive<{
  type: boolean[]
  name: boolean[]
  startDate: boolean[]
  endDate: boolean[]
  ranking: boolean[]
  gpa: boolean[]
  gpaBase: boolean[]
}>(
  {
    type: education.value.map(() => false),
    name: education.value.map(() => false),
    startDate: education.value.map(() => false),
    endDate: education.value.map(() => false),
    ranking: education.value.map(() => false),
    gpa: education.value.map(() => false),
    gpaBase: education.value.map(() => false)
  }
)

// Clear validation error for a specific field
function clearError(index: number, field: 'type' | 'name' | 'startDate' | 'endDate' | 'ranking' | 'gpa' | 'gpaBase') {
  validationErrors[field][index] = false
}

// when parent provides new modelValue, sync into local draft when not editing
import { watch } from 'vue'
watch(
  () => props.modelValue,
  (nv) => {
    if (!localEditing.value) {
      if (nv) education.value = JSON.parse(JSON.stringify(nv))
      // reinitialize calendars; try to parse YYYY-MM into DateValue objects
      ;(async () => {
        const starts = [] as any[]
        const ends = [] as any[]
        for (const edu of education.value) {
          if (edu?.time?.start) starts.push(await createDateValueFromYYYYMM(edu.time.start))
          else starts.push(undefined)
          if (edu?.time?.end) ends.push(await createDateValueFromYYYYMM(edu.time.end))
          else ends.push(undefined)
        }
        startDates.splice(0, startDates.length, ...starts)
        endDates.splice(0, endDates.length, ...ends)
      })()
      // Reset validation errors
      validationErrors.type = education.value.map(() => false)
      validationErrors.name = education.value.map(() => false)
      validationErrors.startDate = education.value.map(() => false)
      validationErrors.endDate = education.value.map(() => false)
      validationErrors.ranking = education.value.map(() => false)
      validationErrors.gpa = education.value.map(() => false)
      validationErrors.gpaBase = education.value.map(() => false)
    } else if (pendingSave.value && nv) {
      // Save succeeded: parent updated modelValue, exit edit mode
      localEditing.value = false
      pendingSave.value = false
      emit('edit-complete')
    }
  },
  { deep: true }
)

const defaultPlaceholder = today(getLocalTimeZone())
const df = new DateFormatter('en-US', { dateStyle: 'medium' })

function addEntry() {
  education.value.push({ type: '', name: '', time: { start: '', end: '' }, major: '', ranking: '', GPA: '', GPA_base: '' })
  startDates.push(undefined)
  endDates.push(undefined)
  validationErrors.type.push(false)
  validationErrors.name.push(false)
  validationErrors.startDate.push(false)
  validationErrors.endDate.push(false)
  validationErrors.ranking.push(false)
  validationErrors.gpa.push(false)
  validationErrors.gpaBase.push(false)
}

function removeEntry(index: number) {
  education.value.splice(index, 1)
  if (startDates.length > index) startDates.splice(index, 1)
  if (endDates.length > index) endDates.splice(index, 1)
  if (validationErrors.type.length > index) validationErrors.type.splice(index, 1)
  if (validationErrors.name.length > index) validationErrors.name.splice(index, 1)
  if (validationErrors.startDate.length > index) validationErrors.startDate.splice(index, 1)
  if (validationErrors.endDate.length > index) validationErrors.endDate.splice(index, 1)
  if (validationErrors.ranking.length > index) validationErrors.ranking.splice(index, 1)
  if (validationErrors.gpa.length > index) validationErrors.gpa.splice(index, 1)
  if (validationErrors.gpaBase.length > index) validationErrors.gpaBase.splice(index, 1)
}

function formatToDate(dv: any, tz: string) {
  if (!dv) return ''
  // dv may be a DateValue-like object with toDate(tz)
  let dt: Date
  if (typeof dv.toDate === 'function') dt = dv.toDate(tz)
  else dt = new Date(dv)
  const m = dt.getMonth() + 1
  const d = dt.getDate()
  return `${dt.getFullYear()}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`
}

function parseDateString(value: string) {
  const parts = value.split('-')
  if (parts.length < 2) return null
  const y = Number(parts[0])
  const m = Number(parts[1])
  const d = parts[2] ? Number(parts[2]) : 1
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null
  return new Date(y, m - 1, d)
}

function toDateOrNull(value: any, tz: string) {
  if (!value) return null
  if (typeof value === 'string') return parseDateString(value)
  if (typeof value.toDate === 'function') return value.toDate(tz)
  const dt = new Date(value)
  return Number.isNaN(dt.getTime()) ? null : dt
}

function isStartAfterEnd(startValue: any, endValue: any, tz: string) {
  const startDate = toDateOrNull(startValue, tz)
  const endDate = toDateOrNull(endValue, tz)
  if (!startDate || !endDate) return false
  return startDate.getTime() > endDate.getTime()
}

function typeLabel(type: string) {
  if (!type) return '-'
  if (type === 'highSchool' || type === 'high school') return t('edu.types.highSchool') || 'High School'
  if (type === 'undergraduate') return t('edu.types.undergraduate') || 'Undergraduate'
  if (type === 'master') return t('edu.types.master') || 'Master'
  if (type === 'doctoral') return t('edu.types.doctoral') || 'Doctoral'
  // Fallback: capitalize first letter of each word
  return type.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
}

function save(e?: Event) {
  if (e && e.preventDefault) e.preventDefault()

  // Remove untouched blank entries so users don't need to manually click Remove.
  const keptEducation: EducationEntry[] = []
  const keptStartDates: any[] = []
  const keptEndDates: any[] = []
  for (let i = 0; i < education.value.length; i++) {
    const edu = education.value[i]
    if (!edu) continue
    const hasAnyField =
      !isBlankValue(edu.type) ||
      !isBlankValue(edu.name) ||
      !isBlankValue(edu.major) ||
      !isBlankValue(edu.ranking) ||
      !isBlankValue(edu.GPA) ||
      !isBlankValue(edu.GPA_base) ||
      !isBlankValue(edu.time?.start) ||
      !isBlankValue(edu.time?.end) ||
      !!startDates[i] ||
      !!endDates[i]
    if (hasAnyField) {
      keptEducation.push(edu)
      keptStartDates.push(startDates[i])
      keptEndDates.push(endDates[i])
    }
  }
  education.value = keptEducation
  startDates.splice(0, startDates.length, ...keptStartDates)
  endDates.splice(0, endDates.length, ...keptEndDates)
  
  // Clear all validation errors first
  validationErrors.type = education.value.map(() => false)
  validationErrors.name = education.value.map(() => false)
  validationErrors.startDate = education.value.map(() => false)
  validationErrors.endDate = education.value.map(() => false)
  validationErrors.ranking = education.value.map(() => false)
  validationErrors.gpa = education.value.map(() => false)
  validationErrors.gpaBase = education.value.map(() => false)

  const rankingPattern = /^\d+\s*\/\s*\d+$/
  const numberPattern = /^-?\d+(\.\d+)?$/

  const parsePositiveNumber = (value: string) => {
    const normalized = value.trim()
    if (!normalized) return undefined
    if (!numberPattern.test(normalized)) return NaN
    const parsed = Number(normalized)
    if (!isFinite(parsed)) return NaN
    return parsed
  }

  let firstErrorMessage = ''

  const setFirstError = (msg: string) => {
    if (!firstErrorMessage) firstErrorMessage = msg
  }
  
  // Validate required fields
  let hasError = false
  const tz = getLocalTimeZone()

  for (let i = 0; i < education.value.length; i++) {
    const edu = education.value[i]
    if (!edu) continue
    
    const hasStartDate = startDates[i] || edu.time?.start
    
    if (!edu.type) {
      validationErrors.type[i] = true
      hasError = true
      setFirstError(t('edu.validation.typeRequired') || `Education #${i + 1}: Type is required`)
    }
    if (!edu.name || !edu.name.trim()) {
      validationErrors.name[i] = true
      hasError = true
      setFirstError(t('edu.validation.nameRequired') || `Education #${i + 1}: Institution name is required`)
    }
    if (!hasStartDate) {
      validationErrors.startDate[i] = true
      hasError = true
      setFirstError(t('edu.validation.startRequired') || `Education #${i + 1}: Start date is required`)
    }

    if (edu.ranking?.trim()) {
      const rankingValue = edu.ranking.trim()
      if (!rankingPattern.test(rankingValue)) {
        validationErrors.ranking[i] = true
        hasError = true
        setFirstError(
          t('edu.validation.rankingFormat', { index: i + 1 }) ||
          `Education #${i + 1}: Ranking must use format X/Y, e.g. 5/200`
        )
      } else {
        const parts = rankingValue.split('/')
        const left = Number(parts[0]?.trim() ?? '')
        const right = Number(parts[1]?.trim() ?? '')
        if (!Number.isInteger(left) || !Number.isInteger(right) || left <= 0 || right <= 0 || left > right) {
          validationErrors.ranking[i] = true
          hasError = true
          setFirstError(
            t('edu.validation.rankingRange', { index: i + 1 }) ||
            `Education #${i + 1}: Ranking must be positive integers with X <= Y`
          )
        }
      }
    }

    if (isStartAfterEnd(startDates[i] ?? edu.time?.start, endDates[i] ?? edu.time?.end, tz)) {
      validationErrors.endDate[i] = true
      hasError = true
      setFirstError(
        t('edu.validation.dateRangeInvalid', { index: i + 1 }) ||
        `Education #${i + 1}: Start date must be before end date`
      )
    }

    const gpa = parsePositiveNumber(edu.GPA ?? '')
    const gpaBase = parsePositiveNumber(edu.GPA_base ?? '')

    if (typeof gpaBase === 'number' && Number.isNaN(gpaBase)) {
      validationErrors.gpaBase[i] = true
      hasError = true
      setFirstError(
        t('edu.validation.gpaBaseInvalid', { index: i + 1 }) ||
        `Education #${i + 1}: GPA base must be a positive number`
      )
    } else if (typeof gpaBase === 'number' && gpaBase <= 0) {
      validationErrors.gpaBase[i] = true
      hasError = true
      setFirstError(
        t('edu.validation.gpaBaseMin', { index: i + 1 }) ||
        `Education #${i + 1}: GPA base must be greater than 0`
      )
    } else if (typeof gpaBase === 'number' && gpaBase > 100) {
      validationErrors.gpaBase[i] = true
      hasError = true
      setFirstError(
        t('edu.validation.gpaBaseMax', { index: i + 1 }) ||
        `Education #${i + 1}: GPA base must be 100 or below`
      )
    }

    if (typeof gpa === 'number' && Number.isNaN(gpa)) {
      validationErrors.gpa[i] = true
      hasError = true
      setFirstError(
        t('edu.validation.gpaInvalid', { index: i + 1 }) ||
        `Education #${i + 1}: GPA must be a positive number`
      )
    } else if (typeof gpa === 'number' && gpa < 0) {
      validationErrors.gpa[i] = true
      hasError = true
      setFirstError(
        t('edu.validation.gpaNegative', { index: i + 1 }) ||
        `Education #${i + 1}: GPA cannot be negative`
      )
    }

    if (typeof gpa === 'number' && typeof gpaBase === 'number' && !Number.isNaN(gpa) && !Number.isNaN(gpaBase) && gpa > gpaBase) {
      validationErrors.gpa[i] = true
      validationErrors.gpaBase[i] = true
      hasError = true
      setFirstError(
        t('edu.validation.gpaExceedsBase', { index: i + 1 }) ||
        `Education #${i + 1}: GPA cannot be greater than GPA base`
      )
    }
  }
  
  if (hasError) {
    if (firstErrorMessage) toast.error(firstErrorMessage)
    return
  }
  
  // convert DateValue to YYYY-MM-DD date strings for storage
  const formatted = education.value.map((edu, i) => ({
    ...edu,
    time: {
      start: startDates[i] ? formatToDate(startDates[i], tz) : edu.time.start,
      end: endDates[i] ? formatToDate(endDates[i], tz) : edu.time.end,
    }
  }))
  // emit save event only; parent will update modelValue on success
  emit('save', JSON.parse(JSON.stringify(formatted)))
  // Don't exit edit mode yet; wait for parent to confirm save success via modelValue update
  pendingSave.value = true
}

function cancel() {
  // discard drafts and notify parent
  if (props.modelValue) education.value = JSON.parse(JSON.stringify(props.modelValue))
  startDates.splice(0, startDates.length, ...education.value.map(() => undefined))
  endDates.splice(0, endDates.length, ...education.value.map(() => undefined))
  // Clear validation errors
  validationErrors.type = education.value.map(() => false)
  validationErrors.name = education.value.map(() => false)
  validationErrors.startDate = education.value.map(() => false)
  validationErrors.endDate = education.value.map(() => false)
  validationErrors.ranking = education.value.map(() => false)
  validationErrors.gpa = education.value.map(() => false)
  validationErrors.gpaBase = education.value.map(() => false)
  emit('cancel')
  pendingSave.value = false
  localEditing.value = false
}

function startEdit() {
  localEditing.value = true
  // Ensure there's at least one entry to edit
  if (education.value.length === 0) {
    education.value.push({
      type: '',
      name: '',
      time: { start: '', end: '' },
      major: '',
      ranking: '',
      GPA: '',
      GPA_base: ''
    })
    startDates.push(undefined)
    endDates.push(undefined)
    validationErrors.type.push(false)
    validationErrors.name.push(false)
    validationErrors.startDate.push(false)
    validationErrors.endDate.push(false)
    validationErrors.ranking.push(false)
    validationErrors.gpa.push(false)
    validationErrors.gpaBase.push(false)
  }
  emit('request-edit')
}

// register with parent profileEditor if available
onMounted(() => {
  if (profileEditor && typeof profileEditor.register === 'function') {
    const unregister = profileEditor.register({ save: () => save(), cancel: () => cancel() })
    onBeforeUnmount(() => unregister())
  }
})
</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <Card>
      <CardHeader class="text-left">
        <div class="flex items-center justify-between gap-4">
          <CardTitle class="text-3xl font-bold">
            {{ t("edu.title") }}
          </CardTitle>
          <div v-if="!localEditing">
            <Button type="button" @click="startEdit">{{ t('profile.edit') || 'Edit' }}</Button>
          </div>
          <div v-else class="flex gap-2">
            <Button type="button" variant="secondary" @click="cancel">{{ t('profile.cancel') || 'Cancel' }}</Button>
            <Button type="button" @click="save">{{ t('profile.save') || 'Save' }}</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
          <div v-if="localEditing">
          <form @submit="save">
            <FieldGroup>
              <template v-for="(edu, idx) in education" :key="idx">
                <Field>
                  <FieldLabel :for="`type-${idx}`">{{ t('edu.type') || 'Type' }} <span class="text-red-500">*</span></FieldLabel>
                  <Select v-model="edu.type" @update:model-value="clearError(idx, 'type')">
                    <SelectTrigger :id="`type-${idx}`" :class="cn('w-full', validationErrors.type[idx] && 'border-red-500')">
                      <SelectValue :placeholder="t('edu.placeholders.type') || 'Select Education type'" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high school">{{ t('edu.types.highSchool') || 'High School' }}</SelectItem>
                      <SelectItem value="undergraduate">{{ t('edu.types.undergraduate') || 'Undergraduate' }}</SelectItem>
                      <SelectItem value="master">{{ t('edu.types.master') || 'Master' }}</SelectItem>
                      <SelectItem value="doctoral">{{ t('edu.types.doctoral') || 'Doctoral' }}</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel :for="`name-${idx}`">{{ t('edu.institution') || 'Institution' }} <span class="text-red-500">*</span></FieldLabel>
                  <Input 
                    :id="`name-${idx}`" 
                    v-model="edu.name" 
                    :placeholder="t('edu.placeholders.institution') || 'University name'" 
                    :class="validationErrors.name[idx] && 'border-red-500'"
                    @input="clearError(idx, 'name')"
                  />
                </Field>

                <div class="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel :for="`start-${idx}`">{{ t('edu.time.start') || 'Start' }} <span class="text-red-500">*</span></FieldLabel>
                      <Popover v-slot="{ close }">
                        <PopoverTrigger as-child>
                          <Button 
                            variant="outline" 
                            :class="cn(
                              'w-full justify-start text-left font-normal', 
                              !edu.time.start && 'text-muted-foreground',
                              validationErrors.startDate[idx] && 'border-red-500'
                            )"
                          >
                            <CalendarIcon class="mr-2 h-4 w-4" />
                            {{ startDates[idx] ? df.format(startDates[idx]!.toDate(getLocalTimeZone())) : (edu.time.start || (t('date.pickStart') || 'Pick start')) }}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent class="w-auto p-0" align="start">
                          <Calendar
                            v-model="startDates[idx]"
                            :default-placeholder="defaultPlaceholder"
                            :max-value="endDates[idx]"
                            layout="month-and-year"
                            initial-focus
                            @update:model-value="(val) => {
                              clearError(idx, 'startDate')
                              if (isStartAfterEnd(val, endDates[idx] ?? edu.time?.end, getLocalTimeZone())) {
                                validationErrors.endDate[idx] = true
                              } else {
                                validationErrors.endDate[idx] = false
                              }
                              close()
                            }"
                          />
                        </PopoverContent>
                      </Popover>
                  </Field>
                  <Field>
                    <FieldLabel :for="`end-${idx}`">{{ t('edu.time.end') || 'End' }}</FieldLabel>
                    <Popover v-slot="{ close }">
                      <PopoverTrigger as-child>
                        <Button variant="outline" :class="cn('w-full justify-start text-left font-normal', !edu.time.end && 'text-muted-foreground', validationErrors.endDate[idx] && 'border-red-500')">
                          <CalendarIcon class="mr-2 h-4 w-4" />
                          {{ endDates[idx] ? df.format(endDates[idx]!.toDate(getLocalTimeZone())) : (edu.time.end || (t('date.pickEnd') || 'Pick end')) }}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent class="w-auto p-0" align="start">
                        <Calendar
                          v-model="endDates[idx]"
                          :default-placeholder="defaultPlaceholder"
                          :min-value="startDates[idx]"
                          layout="month-and-year"
                          initial-focus
                          @update:model-value="() => { clearError(idx, 'endDate'); close(); }"
                        />
                      </PopoverContent>
                    </Popover>
                  </Field>
                </div>

                <Field>
                  <FieldLabel :for="`major-${idx}`">{{ t('edu.major') || 'Major' }}</FieldLabel>
                  <Input :id="`major-${idx}`" v-model="edu.major" :placeholder="t('edu.placeholders.major') || 'Computer Science'" />
                </Field>

                <div class="grid grid-cols-3 gap-4">
                  <Field>
                    <FieldLabel :for="`ranking-${idx}`">{{ t('edu.ranking') || 'Ranking' }}</FieldLabel>
                    <Input
                      :id="`ranking-${idx}`"
                      v-model="edu.ranking"
                      :placeholder="t('edu.placeholders.ranking') || 'e.g. 5/200'"
                      :class="validationErrors.ranking[idx] && 'border-red-500'"
                      @input="clearError(idx, 'ranking')"
                    />
                  </Field>
                  <Field>
                    <FieldLabel :for="`gpa-${idx}`">{{ t('edu.GPA') || 'GPA' }}</FieldLabel>
                    <Input
                      :id="`gpa-${idx}`"
                      v-model="edu.GPA"
                      inputmode="decimal"
                      :placeholder="t('edu.placeholders.gpa') || '3.8'"
                      :class="validationErrors.gpa[idx] && 'border-red-500'"
                      @input="clearError(idx, 'gpa')"
                    />
                  </Field>
                  <Field>
                    <FieldLabel :for="`gpa-base-${idx}`">{{ t('edu.GPA-base') || 'GPA Base' }}</FieldLabel>
                    <Input
                      :id="`gpa-base-${idx}`"
                      v-model="edu.GPA_base"
                      inputmode="decimal"
                      :placeholder="t('edu.placeholders.gpaBase') || '4.0'"
                      :class="validationErrors.gpaBase[idx] && 'border-red-500'"
                      @input="clearError(idx, 'gpaBase')"
                    />
                  </Field>
                </div>

                <div class="flex justify-end gap-2 mt-2">
                  <Button type="button" variant="secondary" @click="removeEntry(idx)">{{ t('profile.remove') || 'Remove' }}</Button>
                </div>

                <hr v-if="idx < education.length - 1" class="my-6 border-t-2 border-muted-foreground/20" />
              </template>
            </FieldGroup>
            
            <div class="flex justify-end gap-2 mt-4">
              <Button type="button" @click="addEntry">{{ t('profile.add') || 'Add' }}</Button>
            </div>
          </form>
        </div>
        <div v-else>
          <div v-if="education && education.length">
            <FieldGroup>
              <template v-for="(edu, idx) in education" :key="idx">
                <Field>
                  <FieldLabel>{{ t('edu.type') || 'Type' }}</FieldLabel>
                  <div class="text-sm text-left">{{ typeLabel(edu.type) }}</div>
                </Field>

                <Field>
                  <FieldLabel>{{ t('edu.institution') || 'Institution' }}</FieldLabel>
                  <div class="text-sm text-left">{{ edu.name || '-' }}</div>
                </Field>

                <div class="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>{{ t('edu.time.start') || 'Start' }}</FieldLabel>
                    <div class="text-sm text-left">{{ startDates[idx] ? df.format(startDates[idx]!.toDate(getLocalTimeZone())) : (edu.time.start || '-') }}</div>
                  </Field>
                  <Field>
                    <FieldLabel>{{ t('edu.time.end') || 'End' }}</FieldLabel>
                    <div class="text-sm text-left">{{ endDates[idx] ? df.format(endDates[idx]!.toDate(getLocalTimeZone())) : (edu.time.end || '-') }}</div>
                  </Field>
                </div>

                <Field>
                  <FieldLabel>{{ t('edu.major') || 'Major' }}</FieldLabel>
                  <div class="text-sm text-left">{{ edu.major || '-' }}</div>
                </Field>

                <div class="grid grid-cols-3 gap-4">
                  <Field>
                    <FieldLabel>{{ t('edu.ranking') || 'Ranking' }}</FieldLabel>
                    <div class="text-sm text-left">{{ edu.ranking || '-' }}</div>
                  </Field>
                  <Field>
                    <FieldLabel>{{ t('edu.GPA') || 'GPA' }}</FieldLabel>
                    <div class="text-sm text-left">{{ edu.GPA || '-' }}</div>
                  </Field>
                  <Field>
                    <FieldLabel>{{ t('edu.GPA-base') || 'GPA Base' }}</FieldLabel>
                    <div class="text-sm text-left">{{ edu.GPA_base || '-' }}</div>
                  </Field>
                </div>

                <hr v-if="idx < education.length - 1" class="my-6 border-t-2 border-muted-foreground/20" />

              </template>
            </FieldGroup>
          </div>
          <div v-else class="text-center text-muted-foreground">
            <div class="mb-2">{{ t('edu.empty') || 'No education records' }}</div>
            <Button type="button" @click="startEdit">{{ t('edu.add') || 'Add education' }}</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>