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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-vue-next'
import { ref, reactive, inject, onBeforeUnmount, onMounted } from 'vue'
import type { Ref } from 'vue'
import { Calendar } from '@/components/ui/calendar'
// (calendar value type will be treated as any to match calendar implementation)
import { DateFormatter, getLocalTimeZone, today } from '@internationalized/date'
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
}>()

// participate in global profile edit/save/cancel via optional provided API
type ProfileEditor = {
  register: (h: { save: () => void; cancel?: () => void }) => () => void
}
const profileEditor = inject<ProfileEditor | null>('profileEditor', null)

// local edit state
const localEditing = ref(false)

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
}

function removeEntry(index: number) {
  if (education.value.length > 1) education.value.splice(index, 1)
  if (startDates.length > index) startDates.splice(index, 1)
  if (endDates.length > index) endDates.splice(index, 1)
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

function save(e?: Event) {
  if (e && e.preventDefault) e.preventDefault()
  // convert DateValue to YYYY-MM strings for storage
  const tz = getLocalTimeZone()
  const formatted = education.value.map((edu, i) => ({
    ...edu,
    time: {
      start: startDates[i] ? formatToDate(startDates[i], tz) : edu.time.start,
      end: endDates[i] ? formatToDate(endDates[i], tz) : edu.time.end,
    }
  }))
  // emit v-model update and save
  emit('update:modelValue', JSON.parse(JSON.stringify(formatted)))
  emit('save', JSON.parse(JSON.stringify(formatted)))
  localEditing.value = false
}

function cancel() {
  // discard drafts and notify parent
  if (props.modelValue) education.value = JSON.parse(JSON.stringify(props.modelValue))
  startDates.splice(0, startDates.length, ...education.value.map(() => undefined))
  endDates.splice(0, endDates.length, ...education.value.map(() => undefined))
  emit('cancel')
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
                  <FieldLabel :for="`type-${idx}`">{{ t('edu.type') || 'Type' }}</FieldLabel>
                  <Select v-model="edu.type">
                    <SelectTrigger :id="`type-${idx}`" class="w-full">
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
                  <FieldLabel :for="`name-${idx}`">{{ t('edu.institution') || 'Institution' }}</FieldLabel>
                  <Input :id="`name-${idx}`" v-model="edu.name" :placeholder="t('edu.placeholders.institution') || 'University name'" />
                </Field>

                <div class="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel :for="`start-${idx}`">{{ t('edu.time.start') || 'Start' }}</FieldLabel>
                      <Popover v-slot="{ close }">
                        <PopoverTrigger as-child>
                          <Button variant="outline" :class="cn('w-full justify-start text-left font-normal', !edu.time.start && 'text-muted-foreground')">
                            <CalendarIcon class="mr-2 h-4 w-4" />
                            {{ startDates[idx] ? df.format(startDates[idx]!.toDate(getLocalTimeZone())) : (edu.time.start || (t('date.pickStart') || 'Pick start')) }}
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
                    <FieldLabel :for="`end-${idx}`">{{ t('edu.time.end') || 'End' }}</FieldLabel>
                    <Popover v-slot="{ close }">
                      <PopoverTrigger as-child>
                        <Button variant="outline" :class="cn('w-full justify-start text-left font-normal', !edu.time.end && 'text-muted-foreground')">
                          <CalendarIcon class="mr-2 h-4 w-4" />
                          {{ endDates[idx] ? df.format(endDates[idx]!.toDate(getLocalTimeZone())) : (edu.time.end || (t('date.pickEnd') || 'Pick end')) }}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent class="w-auto p-0" align="start">
                        <Calendar
                          v-model="endDates[idx]"
                          :default-placeholder="defaultPlaceholder"
                          layout="month-and-year"
                          initial-focus
                          @update:model-value="close"
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
                    <Input :id="`ranking-${idx}`" v-model="edu.ranking" :placeholder="t('edu.placeholders.ranking') || 'e.g. 5/200'" />
                  </Field>
                  <Field>
                    <FieldLabel :for="`gpa-${idx}`">{{ t('edu.GPA') || 'GPA' }}</FieldLabel>
                    <Input :id="`gpa-${idx}`" v-model="edu.GPA" :placeholder="t('edu.placeholders.gpa') || '3.8'" />
                  </Field>
                  <Field>
                    <FieldLabel :for="`gpa-base-${idx}`">{{ t('edu.GPA-base') || 'GPA Base' }}</FieldLabel>
                    <Input :id="`gpa-base-${idx}`" v-model="edu.GPA_base" :placeholder="t('edu.placeholders.gpaBase') || '4.0'" />
                  </Field>
                </div>

                <div v-if="education.length > 1" class="flex justify-end gap-2 mt-2">
                  <Button type="button" variant="secondary" @click="removeEntry(idx)">{{ t('profile.remove') || 'Remove' }}</Button>
                </div>

                <FieldSeparator v-if="idx < education.length - 1" />
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
                  <div class="text-sm text-left">{{ edu.type || '-' }}</div>
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
