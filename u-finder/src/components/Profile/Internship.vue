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

type InternshipEntry = {
  company: string
  role: string
  time: { start: string; end: string }
}

const { t } = useI18n()

const props = defineProps<{
  class?: HTMLAttributes["class"]
  modelValue?: InternshipEntry[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', payload: InternshipEntry[]): void
  (e: 'save', payload: InternshipEntry[]): void
  (e: 'cancel'): void
  (e: 'request-edit'): void
  (e: 'edit-complete'): void
}>()

// participate in global profile edit/save/cancel via optional provided API
import type { ProfileEditor } from '@/types/profileEditor'
const profileEditor = inject<ProfileEditor | null>('profileEditor', null)

// local edit state
const localEditing = ref(false)
const pendingSave = ref(false)
const cardRef = ref<HTMLElement | null>(null)

// local draft state used while editing
const internships: Ref<InternshipEntry[]> = ref(props.modelValue ? JSON.parse(JSON.stringify(props.modelValue)) : [
  {
    company: '',
    role: '',
    time: { start: '', end: '' },
  }
])

// per-entry calendar values for calendar v-models (use `any` to match calendar implementation)
const startDates = reactive<any[]>(internships.value.map(() => undefined))
const endDates = reactive<any[]>(internships.value.map(() => undefined))
// per-entry ongoing flag for "till now" end selection
const ongoing = reactive<boolean[]>(internships.value.map(() => false))

// validation error tracking for each entry
const validationErrors = reactive<{
  company: boolean[]
  role: boolean[]
  dateRange: boolean[]
}>(
  {
    company: internships.value.map(() => false),
    role: internships.value.map(() => false),
    dateRange: internships.value.map(() => false)
  }
)

// Clear validation error for a specific field
function clearError(index: number, field: 'company' | 'role') {
  validationErrors[field][index] = false
}

// when parent provides new modelValue, sync into local draft when not editing
import { watch } from 'vue'
watch(
  () => props.modelValue,
  (nv) => {
    if (!localEditing.value) {
      if (nv) internships.value = JSON.parse(JSON.stringify(nv))
      // reinitialize calendars; try to parse YYYY-MM into DateValue objects
      ;(async () => {
        const starts = [] as any[]
        const ends = [] as any[]
        const ongs = [] as boolean[]
        for (const intern of internships.value) {
          if (intern?.time?.start) starts.push(await createDateValueFromYYYYMM(intern.time.start))
          else starts.push(undefined)
          if (intern?.time?.end) {
            ends.push(await createDateValueFromYYYYMM(intern.time.end))
            ongs.push(false)
          } else {
            ends.push(undefined)
            ongs.push(false)
          }
        }
        startDates.splice(0, startDates.length, ...starts)
        endDates.splice(0, endDates.length, ...ends)
        ongoing.splice(0, ongoing.length, ...ongs)
      })()
      // Reset validation errors
      validationErrors.company = internships.value.map(() => false)
      validationErrors.role = internships.value.map(() => false)
      validationErrors.dateRange = internships.value.map(() => false)
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
  internships.value.push({ company: '', role: '', time: { start: '', end: '' } })
  startDates.push(undefined)
  endDates.push(undefined)
  ongoing.push(false)
  validationErrors.company.push(false)
  validationErrors.role.push(false)
  validationErrors.dateRange.push(false)
}

function removeEntry(index: number) {
  internships.value.splice(index, 1)
  if (startDates.length > index) startDates.splice(index, 1)
  if (endDates.length > index) endDates.splice(index, 1)
  if (ongoing.length > index) ongoing.splice(index, 1)
  if (validationErrors.company.length > index) validationErrors.company.splice(index, 1)
  if (validationErrors.role.length > index) validationErrors.role.splice(index, 1)
  if (validationErrors.dateRange.length > index) validationErrors.dateRange.splice(index, 1)
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

function save(e?: Event) {
  if (e && e.preventDefault) e.preventDefault()

  // Remove untouched blank entries so users don't need to manually click Remove.
  const keptInternships: InternshipEntry[] = []
  const keptStartDates: any[] = []
  const keptEndDates: any[] = []
  const keptOngoing: boolean[] = []
  for (let i = 0; i < internships.value.length; i++) {
    const intern = internships.value[i]
    if (!intern) continue
    const hasAnyField =
      !isBlankValue(intern.company) ||
      !isBlankValue(intern.role) ||
      !isBlankValue(intern.time?.start) ||
      !isBlankValue(intern.time?.end) ||
      !!startDates[i] ||
      !!endDates[i] ||
      !!ongoing[i]
    if (hasAnyField) {
      keptInternships.push(intern)
      keptStartDates.push(startDates[i])
      keptEndDates.push(endDates[i])
      keptOngoing.push(!!ongoing[i])
    }
  }
  internships.value = keptInternships
  startDates.splice(0, startDates.length, ...keptStartDates)
  endDates.splice(0, endDates.length, ...keptEndDates)
  ongoing.splice(0, ongoing.length, ...keptOngoing)
  
  // Clear all validation errors first
  validationErrors.company = internships.value.map(() => false)
  validationErrors.role = internships.value.map(() => false)
  validationErrors.dateRange = internships.value.map(() => false)
  
  // Validate required fields
  let hasError = false
  const tz = getLocalTimeZone()

  for (let i = 0; i < internships.value.length; i++) {
    const intern = internships.value[i]
    if (!intern) continue
    
    if (!intern.company || !intern.company.trim()) {
      validationErrors.company[i] = true
      hasError = true
      toast.error(t('internship.validation.companyRequired') || `Internship #${i + 1}: Company name is required`)
    }
    if (!intern.role || !intern.role.trim()) {
      validationErrors.role[i] = true
      hasError = true
      if (!validationErrors.company[i]) {
        toast.error(t('internship.validation.roleRequired') || `Internship #${i + 1}: Role is required`)
      }
    }

    const endValue = ongoing[i] ? today(tz) : (endDates[i] ?? intern.time?.end)
    if (isStartAfterEnd(startDates[i] ?? intern.time?.start, endValue, tz)) {
      validationErrors.dateRange[i] = true
      hasError = true
      toast.error(
        t('internship.validation.dateRangeInvalid', { index: i + 1 }) ||
        `Internship #${i + 1}: Start date must be before end date`
      )
    }
  }
  
  if (hasError) {
    return
  }
  
  // convert DateValue to YYYY-MM-DD date strings for storage
  const formatted = internships.value.map((intern, i) => ({
    ...intern,
    time: {
      start: startDates[i] ? formatToDate(startDates[i], tz) : intern.time.start,
      end: ongoing[i]
        ? formatToDate(today(tz), tz)
        : (endDates[i] ? formatToDate(endDates[i], tz) : intern.time.end),
    }
  }))
  // emit save event only; parent will update modelValue on success
  emit('save', JSON.parse(JSON.stringify(formatted)))
  // Don't exit edit mode yet; wait for parent to confirm save success via modelValue update
  pendingSave.value = true
}

function cancel() {
  // discard drafts and notify parent
  if (props.modelValue) internships.value = JSON.parse(JSON.stringify(props.modelValue))
  startDates.splice(0, startDates.length, ...internships.value.map(() => undefined))
  endDates.splice(0, endDates.length, ...internships.value.map(() => undefined))
  ongoing.splice(0, ongoing.length, ...internships.value.map(() => false))
  // Clear validation errors
  validationErrors.company = internships.value.map(() => false)
  validationErrors.role = internships.value.map(() => false)
  validationErrors.dateRange = internships.value.map(() => false)
  emit('cancel')
  pendingSave.value = false
  localEditing.value = false
}

function startEdit() {
  localEditing.value = true
  profileEditor?.setActiveEl(cardRef.value)
  if (internships.value.length === 0) {
    internships.value.push({ company: '', role: '', time: { start: '', end: '' } })
    startDates.push(undefined)
    endDates.push(undefined)
    ongoing.push(false)
    validationErrors.company.push(false)
    validationErrors.role.push(false)
    validationErrors.dateRange.push(false)
  }
  emit('request-edit')
}

// register with parent profileEditor if available
onMounted(() => {
  if (profileEditor && typeof profileEditor.register === 'function') {
    const unregister = profileEditor.register({ save: () => save(), cancel: () => cancel(), isEditing: localEditing, isSaving: pendingSave, el: cardRef })
    onBeforeUnmount(() => unregister())
  }
})
</script>

<template>
  <div ref="cardRef" @focusin="profileEditor?.setActiveEl(cardRef)" :class="cn('flex flex-col gap-6', props.class)">
    <Card>
      <CardHeader class="text-left">
        <div class="flex items-center justify-between gap-4">
          <CardTitle class="text-3xl font-bold">
            {{ t('internship.title') || 'Internships' }}
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
              <template v-for="(intern, idx) in internships" :key="idx">
                <Field>
                  <FieldLabel :for="`company-${idx}`">{{ t('internship.company') || 'Company' }} <span class="text-red-500">*</span></FieldLabel>
                  <Input 
                    :id="`company-${idx}`" 
                    v-model="intern.company" 
                    :placeholder="t('internship.placeholders.company') || 'Company name'" 
                    :class="validationErrors.company[idx] && 'border-red-500'"
                    @input="clearError(idx, 'company')"
                  />
                </Field>

                <Field>
                  <FieldLabel :for="`role-${idx}`">{{ t('internship.role') || 'Role' }} <span class="text-red-500">*</span></FieldLabel>
                  <Input 
                    :id="`role-${idx}`" 
                    v-model="intern.role" 
                    :placeholder="t('internship.placeholders.role') || 'Position / Role'" 
                    :class="validationErrors.role[idx] && 'border-red-500'"
                    @input="clearError(idx, 'role')"
                  />
                </Field>

                <div class="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel :for="`start-${idx}`">{{ t('internship.time.start') || 'Start' }}</FieldLabel>
                      <Popover v-slot="{ close }">
                        <PopoverTrigger as-child>
                          <Button variant="outline" :class="cn('w-full justify-start text-left font-normal', !intern.time.start && 'text-muted-foreground')">
                            <CalendarIcon class="mr-2 h-4 w-4" />
                            {{ startDates[idx] ? df.format(startDates[idx]!.toDate(getLocalTimeZone())) : (intern.time.start || (t('date.pickStart') || 'Pick start')) }}
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
                              if (isStartAfterEnd(val, ongoing[idx] ? today(getLocalTimeZone()) : (endDates[idx] ?? intern.time?.end), getLocalTimeZone())) {
                                validationErrors.dateRange[idx] = true
                              } else {
                                validationErrors.dateRange[idx] = false
                              }
                              close()
                            }"
                          />
                        </PopoverContent>
                      </Popover>
                  </Field>
                  <Field>
                    <FieldLabel :for="`end-${idx}`">{{ t('internship.time.end') || 'End' }}</FieldLabel>
                    <Popover v-slot="{ close }">
                      <PopoverTrigger as-child>
                        <Button variant="outline" :class="cn('w-full justify-start text-left font-normal', !intern.time.end && 'text-muted-foreground', validationErrors.dateRange[idx] && 'border-red-500')">
                          <CalendarIcon class="mr-2 h-4 w-4" />
                            {{ ongoing[idx] ? (t('internship.time.till now') || 'Till now') : (endDates[idx] ? df.format(endDates[idx]!.toDate(getLocalTimeZone())) : (intern.time.end || (t('date.pickEnd') || 'Pick end'))) }}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent class="w-auto p-0" align="start">
                          <Calendar
                            v-model="endDates[idx]"
                            :default-placeholder="defaultPlaceholder"
                            :min-value="startDates[idx]"
                            layout="month-and-year"
                            initial-focus
                            @update:model-value="(val) => {
                              endDates[idx] = val
                              ongoing[idx] = false
                              if (intern.time) intern.time.end = formatToDate(val, getLocalTimeZone())
                              validationErrors.dateRange[idx] = false
                              close()
                            }"
                          />
                          <div class="p-2 border-t">
                            <Button type="button" variant="secondary" class="w-full" @click="(ongoing[idx]=true, endDates[idx]=today(getLocalTimeZone()), validationErrors.dateRange[idx]=false, (intern.time && (intern.time.end = formatToDate(endDates[idx], getLocalTimeZone()))), close())">
                              {{ t('internship.time.till now') || 'Till now' }}
                            </Button>
                          </div>
                      </PopoverContent>
                    </Popover>
                  </Field>
                </div>

                <div class="flex justify-end gap-2 mt-2">
                  <Button type="button" variant="secondary" @click="removeEntry(idx)">{{ t('profile.remove') || 'Remove' }}</Button>
                </div>

                <FieldSeparator v-if="idx < internships.length - 1" />
              </template>
            </FieldGroup>
            
            <div class="flex justify-end gap-2 mt-4">
              <Button type="button" @click="addEntry">{{ t('profile.add') || 'Add' }}</Button>
            </div>
          </form>
        </div>
        <div v-else>
          <div v-if="internships && internships.length">
            <FieldGroup>
              <template v-for="(intern, idx) in internships" :key="idx">
                <Field>
                  <FieldLabel>{{ t('internship.company') || 'Company' }}</FieldLabel>
                  <div class="text-sm text-left">{{ intern.company || '-' }}</div>
                </Field>

                <Field>
                  <FieldLabel>{{ t('internship.role') || 'Role' }}</FieldLabel>
                  <div class="text-sm text-left">{{ intern.role || '-' }}</div>
                </Field>

                <div class="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>{{ t('internship.time.start') || 'Start' }}</FieldLabel>
                    <div class="text-sm text-left">{{ startDates[idx] ? df.format(startDates[idx]!.toDate(getLocalTimeZone())) : (intern.time.start || '-') }}</div>
                  </Field>
                  <Field>
                    <FieldLabel>{{ t('internship.time.end') || 'End' }}</FieldLabel>
                    <div class="text-sm text-left">{{ ongoing[idx] ? (t('internship.time.till now') || 'Till now') : (endDates[idx] ? df.format(endDates[idx]!.toDate(getLocalTimeZone())) : (intern.time.end || '-')) }}</div>
                  </Field>
                </div>

              </template>
            </FieldGroup>
          </div>
          <div v-else class="text-center text-muted-foreground">
            <div class="mb-2">{{ t('internship.empty') || 'No internships' }}</div>
            <Button type="button" @click="startEdit">{{ t('internship.add') || 'Add internship' }}</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
