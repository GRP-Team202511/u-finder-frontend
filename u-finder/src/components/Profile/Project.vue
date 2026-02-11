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

type ProjectEntry = {
  name: string
  role: string
  time: { start: string; end: string }
  description: string
}

const { t } = useI18n()

const props = defineProps<{
  class?: HTMLAttributes["class"]
  modelValue?: ProjectEntry[]
  editable?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', payload: ProjectEntry[]): void
  (e: 'save', payload: ProjectEntry[]): void
  (e: 'cancel'): void
  (e: 'request-edit'): void
}>()

// participate in global profile edit/save/cancel via optional provided API
type ProfileEditor = {
  register: (h: { save: () => void; cancel?: () => void }) => () => void
}
const profileEditor = inject<ProfileEditor | null>('profileEditor', null)

// local draft state used while editing
const projects: Ref<ProjectEntry[]> = ref(props.modelValue ? JSON.parse(JSON.stringify(props.modelValue)) : [
  {
    name: '',
    role: '',
    time: { start: '', end: '' },
    description: '',
  }
])

// per-entry calendar values for calendar v-models (use `any` to match calendar implementation)
const startDates = reactive<any[]>(projects.value.map(() => undefined))
const endDates = reactive<any[]>(projects.value.map(() => undefined))
// per-entry ongoing flag for "till now" end selection
const ongoing = reactive<boolean[]>(projects.value.map(() => false))

// when parent provides new modelValue, sync into local draft when not editing
import { watch } from 'vue'
watch(
  () => props.modelValue,
  (nv) => {
    if (!props.editable) {
      if (nv) projects.value = JSON.parse(JSON.stringify(nv))
      // reinitialize calendars; try to parse YYYY-MM into DateValue objects
      ;(async () => {
        const starts = [] as any[]
        const ends = [] as any[]
        const ongs = [] as boolean[]
        for (const project of projects.value) {
          if (project?.time?.start) starts.push(await createDateValueFromYYYYMM(project.time.start))
          else starts.push(undefined)
          if (project?.time?.end) {
            ends.push(await createDateValueFromYYYYMM(project.time.end))
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
  projects.value.push({ name: '', role: '', time: { start: '', end: '' }, description: '' })
  startDates.push(undefined)
  endDates.push(undefined)
  ongoing.push(false)
}

function removeEntry(index: number) {
  if (projects.value.length > 1) projects.value.splice(index, 1)
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
  const formatted = projects.value.map((project, i) => ({
    ...project,
    time: {
      start: startDates[i] ? formatToMonth(startDates[i], tz) : project.time.start,
      end: ongoing[i]
        ? formatToMonth(today(tz), tz)
        : (endDates[i] ? formatToMonth(endDates[i], tz) : project.time.end),
    }
  }))
  // emit v-model update and save
  emit('update:modelValue', JSON.parse(JSON.stringify(formatted)))
  emit('save', JSON.parse(JSON.stringify(formatted)))
}

function cancel() {
  // discard drafts and notify parent
  if (props.modelValue) projects.value = JSON.parse(JSON.stringify(props.modelValue))
  startDates.splice(0, startDates.length, ...projects.value.map(() => undefined))
  endDates.splice(0, endDates.length, ...projects.value.map(() => undefined))
  ongoing.splice(0, ongoing.length, ...projects.value.map(() => false))
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
          {{ t('project.title') || 'projects' }}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="props.editable">
          <form @submit="save">
            <FieldGroup>
              <template v-for="(project, idx) in projects" :key="idx">
                <Field>
                  <FieldLabel :for="`name-${idx}`">{{ t('project.name') || 'name' }}</FieldLabel>
                  <Input :id="`name-${idx}`" v-model="project.name" placeholder="Project's Name" />
                </Field>

                <Field>
                  <FieldLabel :for="`role-${idx}`">{{ t('project.role') || 'Role' }}</FieldLabel>
                  <Input :id="`role-${idx}`" v-model="project.role" placeholder="Role" />
                </Field>

                <div class="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel :for="`start-${idx}`">{{ t('project.time.start') || 'Start' }}</FieldLabel>
                      <Popover v-slot="{ close }">
                        <PopoverTrigger as-child>
                          <Button variant="outline" :class="cn('w-full justify-start text-left font-normal', !project.time.start && 'text-muted-foreground')">
                            <CalendarIcon class="mr-2 h-4 w-4" />
                            {{ startDates[idx] ? df.format(startDates[idx]!.toDate(getLocalTimeZone())) : (project.time.start || 'Pick start') }}
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
                    <FieldLabel :for="`end-${idx}`">{{ t('project.time.end') || 'End' }}</FieldLabel>
                    <Popover v-slot="{ close }">
                      <PopoverTrigger as-child>
                        <Button variant="outline" :class="cn('w-full justify-start text-left font-normal', !project.time.end && 'text-muted-foreground')">
                          <CalendarIcon class="mr-2 h-4 w-4" />
                            {{ ongoing[idx] ? (t('project.time.till now') || 'Till now') : (endDates[idx] ? df.format(endDates[idx]!.toDate(getLocalTimeZone())) : (project.time.end || 'Pick end')) }}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent class="w-auto p-0" align="start">
                          <Calendar
                            v-model="endDates[idx]"
                            :default-placeholder="defaultPlaceholder"
                            layout="month-and-year"
                            initial-focus
                            @update:model-value="(val) => (endDates[idx]=val, ongoing[idx]=false, (project.time && (project.time.end = formatToMonth(val, getLocalTimeZone()))), close())"
                          />
                          <div class="p-2 border-t">
                            <Button type="button" variant="secondary" class="w-full" @click="(ongoing[idx]=true, endDates[idx]=today(getLocalTimeZone()), (project.time && (project.time.end = formatToMonth(endDates[idx], getLocalTimeZone()))), close())">
                              {{ t('project.time.till now') || 'Till now' }}
                            </Button>
                          </div>
                      </PopoverContent>
                    </Popover>
                  </Field>
                </div>

                <Field>
                  <FieldLabel :for="`description-${idx}`">{{ t('project.description') || 'Description' }}</FieldLabel>
                  <textarea
                    :id="`description-${idx}`"
                    v-model="project.description"
                    placeholder="Description"
                    rows="6"
                    class="w-full rounded-md border px-3 py-2 text-sm"
                  ></textarea>
                </Field>

                <div class="flex justify-end gap-2 mt-2">
                  <Button type="button" variant="secondary" @click="removeEntry(idx)">Remove</Button>
                  <Button type="button" @click="addEntry">Add</Button>
                </div>
              </template>
            </FieldGroup>
          </form>
        </div>
        <div v-else>
          <div v-if="projects && projects.length">
            <FieldGroup>
              <template v-for="(project, idx) in projects" :key="idx">
                <Field>
                  <FieldLabel>{{ t('project.name') || 'name' }}</FieldLabel>
                  <div class="text-sm text-left">{{ project.name || '-' }}</div>
                </Field>

                <Field>
                  <FieldLabel>{{ t('project.role') || 'Role' }}</FieldLabel>
                  <div class="text-sm text-left">{{ project.role || '-' }}</div>
                </Field>

                <div class="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>{{ t('project.time.start') || 'Start' }}</FieldLabel>
                    <div class="text-sm text-left">{{ startDates[idx] ? df.format(startDates[idx]!.toDate(getLocalTimeZone())) : (project.time.start || '-') }}</div>
                  </Field>
                  <Field>
                    <FieldLabel>{{ t('project.time.end') || 'End' }}</FieldLabel>
                    <div class="text-sm text-left">{{ ongoing[idx] ? (t('project.time.till now') || 'Till now') : (endDates[idx] ? df.format(endDates[idx]!.toDate(getLocalTimeZone())) : (project.time.end || '-')) }}</div>
                  </Field>
                </div>

                <Field>
                  <FieldLabel>{{ t('project.description') || 'Description' }}</FieldLabel>
                  <div class="text-sm text-left whitespace-pre-wrap break-words">{{ project.description || '-' }}</div>
                </Field>

              </template>
            </FieldGroup>
          </div>
          <div v-else class="text-center text-muted-foreground">
            <div class="mb-2">{{ t('project.empty') || 'No projects' }}</div>
            <Button type="button" @click="$emit('request-edit')">{{ t('project.add') || 'Add project' }}</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
