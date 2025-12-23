<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
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
// helper: create a DateValue-like object from YYYY-MM using the library if available,
// otherwise return a shim with `toDate(tz)` so the calendar can consume it.
async function createDateValueFromYYYYMM(yyyyMm: string) {
  if (!yyyyMm) return undefined
  const parts = yyyyMm.split('-')
  if (parts.length < 2) return undefined
  const [p0 = '', p1 = ''] = parts
  const y = parseInt(p0, 10)
  const m = parseInt(p1, 10)
  if (!isFinite(y) || !isFinite(m)) return undefined
  try {
    const mod = await import('@internationalized/date')
    const anyMod = mod as any
    // try common constructors in the library (access as any to avoid TS complaints)
    if (anyMod.CalendarDate) {
      try {
        return new anyMod.CalendarDate(y, m, 1)
      } catch (err) {
        // ignore and try other factories
      }
    }
    if (anyMod.createCalendarDate) {
      try {
        return anyMod.createCalendarDate(y, m, 1)
      } catch (err) {
        // ignore
      }
    }
    if (anyMod.createCalendar) {
      // fallback: try to create from ISO string if helper exists
      try {
        const iso = `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-01T00:00:00`
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
    toDate: (_tz?: string) => new Date(y, m - 1, 1),
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
  editable?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', payload: InternshipEntry[]): void
  (e: 'save', payload: InternshipEntry[]): void
  (e: 'cancel'): void
  (e: 'request-edit'): void
}>()

// participate in global profile edit/save/cancel via optional provided API
type ProfileEditor = {
  register: (h: { save: () => void; cancel?: () => void }) => () => void
}
const profileEditor = inject<ProfileEditor | null>('profileEditor', null)

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

// when parent provides new modelValue, sync into local draft when not editing
import { watch } from 'vue'
watch(
  () => props.modelValue,
  (nv) => {
    if (!props.editable) {
      if (nv) internships.value = JSON.parse(JSON.stringify(nv))
      // reinitialize calendars; try to parse YYYY-MM into DateValue objects
      ;(async () => {
        const starts = [] as any[]
        const ends = [] as any[]
        const ongs = [] as boolean[]
        for (const intern of internships.value) {
          if (intern?.time?.start) starts.push(await createDateValueFromYYYYMM(intern.time.start))
          else starts.push(undefined)
          if (intern?.time?.end === 'till now') {
            ends.push(undefined)
            ongs.push(true)
          } else if (intern?.time?.end) {
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
    }
  },
  { deep: true }
)

const defaultPlaceholder = today(getLocalTimeZone())
const df = new DateFormatter('en-US', { dateStyle: 'long' })

function addEntry() {
  internships.value.push({ company: '', role: '', time: { start: '', end: '' } })
  startDates.push(undefined)
  endDates.push(undefined)
  ongoing.push(false)
}

function removeEntry(index: number) {
  if (internships.value.length > 1) internships.value.splice(index, 1)
  if (startDates.length > index) startDates.splice(index, 1)
  if (endDates.length > index) endDates.splice(index, 1)
  if (ongoing.length > index) ongoing.splice(index, 1)
}

function formatToMonth(dv: any, tz: string) {
  if (!dv) return ''
  // dv may be a DateValue-like object with toDate(tz)
  let dt: Date
  if (typeof dv.toDate === 'function') dt = dv.toDate(tz)
  else dt = new Date(dv)
  const m = dt.getMonth() + 1
  return `${dt.getFullYear()}-${m.toString().padStart(2, '0')}`
}

function save(e?: Event) {
  if (e && e.preventDefault) e.preventDefault()
  // convert DateValue to YYYY-MM strings for storage
  const tz = getLocalTimeZone()
  const formatted = internships.value.map((intern, i) => ({
    ...intern,
    time: {
      start: startDates[i] ? formatToMonth(startDates[i], tz) : intern.time.start,
      end: ongoing[i]
        ? 'till now'
        : (endDates[i] ? formatToMonth(endDates[i], tz) : intern.time.end),
    }
  }))
  // emit v-model update and save
  emit('update:modelValue', JSON.parse(JSON.stringify(formatted)))
  emit('save', JSON.parse(JSON.stringify(formatted)))
}

function cancel() {
  // discard drafts and notify parent
  if (props.modelValue) internships.value = JSON.parse(JSON.stringify(props.modelValue))
  startDates.splice(0, startDates.length, ...internships.value.map(() => undefined))
  endDates.splice(0, endDates.length, ...internships.value.map(() => undefined))
  ongoing.splice(0, ongoing.length, ...internships.value.map(i => (i?.time?.end === 'till now')))
  emit('cancel')
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
        <CardTitle class="text-3xl font-bold">
          {{ t('internship.title') || 'Internships' }}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="props.editable">
          <form @submit="save">
            <FieldGroup>
              <template v-for="(intern, idx) in internships" :key="idx">
                <Field>
                  <FieldLabel :for="`company-${idx}`">{{ t('internship.company') || 'Company' }}</FieldLabel>
                  <Input :id="`company-${idx}`" v-model="intern.company" placeholder="Company name" />
                </Field>

                <Field>
                  <FieldLabel :for="`role-${idx}`">{{ t('internship.role') || 'Role' }}</FieldLabel>
                  <Input :id="`role-${idx}`" v-model="intern.role" placeholder="Position / Role" />
                </Field>

                <div class="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel :for="`start-${idx}`">{{ t('internship.time.start') || 'Start' }}</FieldLabel>
                      <Popover v-slot="{ close }">
                        <PopoverTrigger as-child>
                          <Button variant="outline" :class="cn('w-full justify-start text-left font-normal', !intern.time.start && 'text-muted-foreground')">
                            <CalendarIcon class="mr-2 h-4 w-4" />
                            {{ startDates[idx] ? df.format(startDates[idx]!.toDate(getLocalTimeZone())) : (intern.time.start || 'Pick start') }}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent class="w-auto p-0" align="start">
                          <Calendar
                            v-model="startDates[idx]"
                            :default-placeholder="defaultPlaceholder"
                            layout="month-and-year"
                            initial-focus
                            @update:model-value="close"
                          />
                        </PopoverContent>
                      </Popover>
                  </Field>
                  <Field>
                    <FieldLabel :for="`end-${idx}`">{{ t('internship.time.end') || 'End' }}</FieldLabel>
                    <Popover v-slot="{ close }">
                      <PopoverTrigger as-child>
                        <Button variant="outline" :class="cn('w-full justify-start text-left font-normal', !intern.time.end && 'text-muted-foreground')">
                          <CalendarIcon class="mr-2 h-4 w-4" />
                            {{ (ongoing[idx] || intern.time.end === 'till now') ? (t('internship.time.till now') || 'till now') : (endDates[idx] ? df.format(endDates[idx]!.toDate(getLocalTimeZone())) : (intern.time.end || 'Pick end')) }}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent class="w-auto p-0" align="start">
                          <Calendar
                            v-model="endDates[idx]"
                            :default-placeholder="defaultPlaceholder"
                            layout="month-and-year"
                            initial-focus
                            @update:model-value="(val) => (endDates[idx]=val, ongoing[idx]=false, close())"
                          />
                          <div class="p-2 border-t">
                            <Button type="button" variant="secondary" class="w-full" @click="(ongoing[idx]=true, endDates[idx]=undefined, (intern.time && (intern.time.end = 'till now')), close())">
                              {{ t('internship.time.till now') || 'till now' }}
                            </Button>
                          </div>
                      </PopoverContent>
                    </Popover>
                  </Field>
                </div>

                <div class="flex justify-end gap-2 mt-2">
                  <Button type="button" variant="secondary" @click="removeEntry(idx)">Remove</Button>
                  <Button type="button" @click="addEntry">Add</Button>
                </div>
              </template>
            </FieldGroup>
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
                    <div class="text-sm text-left">{{ (ongoing[idx] || intern.time.end === 'till now') ? (t('internship.time.till now') || 'till now') : (endDates[idx] ? df.format(endDates[idx]!.toDate(getLocalTimeZone())) : (intern.time.end || '-')) }}</div>
                  </Field>
                </div>

              </template>
            </FieldGroup>
          </div>
          <div v-else class="text-center text-muted-foreground">
            <div class="mb-2">{{ t('internship.empty') || 'No internships' }}</div>
            <Button type="button" @click="$emit('request-edit')">{{ t('internship.add') || 'Add internship' }}</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
