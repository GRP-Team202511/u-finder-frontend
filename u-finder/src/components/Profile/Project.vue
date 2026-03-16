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
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', payload: ProjectEntry[]): void
  (e: 'save', payload: ProjectEntry[]): void
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

// validation error tracking for each entry
const validationErrors = reactive<{
  name: boolean[]
}>(
  {
    name: projects.value.map(() => false)
  }
)

// Clear validation error for a specific field
function clearError(index: number, field: 'name') {
  validationErrors[field][index] = false
}

// when parent provides new modelValue, sync into local draft when not editing
import { watch } from 'vue'
watch(
  () => props.modelValue,
  (nv) => {
    if (!localEditing.value) {
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
      // Reset validation errors
      validationErrors.name = projects.value.map(() => false)
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
  projects.value.push({ name: '', role: '', time: { start: '', end: '' }, description: '' })
  startDates.push(undefined)
  endDates.push(undefined)
  ongoing.push(false)
  validationErrors.name.push(false)
}

function removeEntry(index: number) {
  projects.value.splice(index, 1)
  if (startDates.length > index) startDates.splice(index, 1)
  if (endDates.length > index) endDates.splice(index, 1)
  if (ongoing.length > index) ongoing.splice(index, 1)
  if (validationErrors.name.length > index) validationErrors.name.splice(index, 1)
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

  // Remove untouched blank entries so users don't need to manually click Remove.
  const keptProjects: ProjectEntry[] = []
  const keptStartDates: any[] = []
  const keptEndDates: any[] = []
  const keptOngoing: boolean[] = []
  for (let i = 0; i < projects.value.length; i++) {
    const project = projects.value[i]
    if (!project) continue
    const hasAnyField =
      !isBlankValue(project.name) ||
      !isBlankValue(project.role) ||
      !isBlankValue(project.description) ||
      !isBlankValue(project.time?.start) ||
      !isBlankValue(project.time?.end) ||
      !!startDates[i] ||
      !!endDates[i] ||
      !!ongoing[i]
    if (hasAnyField) {
      keptProjects.push(project)
      keptStartDates.push(startDates[i])
      keptEndDates.push(endDates[i])
      keptOngoing.push(!!ongoing[i])
    }
  }
  projects.value = keptProjects
  startDates.splice(0, startDates.length, ...keptStartDates)
  endDates.splice(0, endDates.length, ...keptEndDates)
  ongoing.splice(0, ongoing.length, ...keptOngoing)
  
  // Clear all validation errors first
  validationErrors.name = projects.value.map(() => false)
  
  // Validate required fields
  let hasError = false
  for (let i = 0; i < projects.value.length; i++) {
    const project = projects.value[i]
    if (!project) continue
    
    if (!project.name || !project.name.trim()) {
      validationErrors.name[i] = true
      hasError = true
      toast.error(t('project.validation.nameRequired') || `Project #${i + 1}: Project name is required`)
    }
  }
  
  if (hasError) {
    return
  }
  
  // convert DateValue to YYYY-MM strings for storage
  const tz = getLocalTimeZone()
  const formatted = projects.value.map((project, i) => ({
    ...project,
    time: {
      start: startDates[i] ? formatToDate(startDates[i], tz) : project.time.start,
      end: ongoing[i]
        ? formatToDate(today(tz), tz)
        : (endDates[i] ? formatToDate(endDates[i], tz) : project.time.end),
    }
  }))
  // emit save event only; parent will update modelValue on success
  emit('save', JSON.parse(JSON.stringify(formatted)))
  // Don't exit edit mode yet; wait for parent to confirm save success via modelValue update
  pendingSave.value = true
}

function cancel() {
  // discard drafts and notify parent
  if (props.modelValue) projects.value = JSON.parse(JSON.stringify(props.modelValue))
  startDates.splice(0, startDates.length, ...projects.value.map(() => undefined))
  endDates.splice(0, endDates.length, ...projects.value.map(() => undefined))
  ongoing.splice(0, ongoing.length, ...projects.value.map(() => false))
  // Clear validation errors
  validationErrors.name = projects.value.map(() => false)
  emit('cancel')
  pendingSave.value = false
  localEditing.value = false
}

function startEdit() {
  localEditing.value = true
  // Ensure there's at least one entry to edit
  if (projects.value.length === 0) {
    projects.value.push({ name: '', role: '', time: { start: '', end: '' }, description: '' })
    startDates.push(undefined)
    endDates.push(undefined)
    ongoing.push(false)
    validationErrors.name.push(false)
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
            {{ t('project.title') || 'projects' }}
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
              <template v-for="(project, idx) in projects" :key="idx">
                <Field>
                  <FieldLabel :for="`name-${idx}`">{{ t('project.name') || 'name' }} <span class="text-red-500">*</span></FieldLabel>
                  <Input 
                    :id="`name-${idx}`" 
                    v-model="project.name" 
                    :placeholder="t('project.placeholders.name') || 'Project name'" 
                    :class="validationErrors.name[idx] && 'border-red-500'"
                    @input="clearError(idx, 'name')"
                  />
                </Field>

                <Field>
                  <FieldLabel :for="`role-${idx}`">{{ t('project.role') || 'Role' }}</FieldLabel>
                  <Input :id="`role-${idx}`" v-model="project.role" :placeholder="t('project.placeholders.role') || 'Role'" />
                </Field>

                <div class="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel :for="`start-${idx}`">{{ t('project.time.start') || 'Start' }}</FieldLabel>
                      <Popover v-slot="{ close }">
                        <PopoverTrigger as-child>
                          <Button variant="outline" :class="cn('w-full justify-start text-left font-normal', !project.time.start && 'text-muted-foreground')">
                            <CalendarIcon class="mr-2 h-4 w-4" />
                            {{ startDates[idx] ? df.format(startDates[idx]!.toDate(getLocalTimeZone())) : (project.time.start || (t('date.pickStart') || 'Pick start')) }}
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
                            {{ ongoing[idx] ? (t('project.time.till now') || 'Till now') : (endDates[idx] ? df.format(endDates[idx]!.toDate(getLocalTimeZone())) : (project.time.end || (t('date.pickEnd') || 'Pick end'))) }}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent class="w-auto p-0" align="start">
                          <Calendar
                            v-model="endDates[idx]"
                            :default-placeholder="defaultPlaceholder"
                            layout="month-and-year"
                            initial-focus
                            @update:model-value="(val) => (endDates[idx]=val, ongoing[idx]=false, (project.time && (project.time.end = formatToDate(val, getLocalTimeZone()))), close())"
                          />
                          <div class="p-2 border-t">
                            <Button type="button" variant="secondary" class="w-full" @click="(ongoing[idx]=true, endDates[idx]=today(getLocalTimeZone()), (project.time && (project.time.end = formatToDate(endDates[idx], getLocalTimeZone()))), close())">
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
                    :placeholder="t('project.placeholders.description') || 'Description'"
                    rows="6"
                    class="w-full rounded-md border px-3 py-2 text-sm"
                  ></textarea>
                </Field>

                <div class="flex justify-end gap-2 mt-2">
                  <Button type="button" variant="secondary" @click="removeEntry(idx)">{{ t('profile.remove') || 'Remove' }}</Button>
                </div>

                <FieldSeparator v-if="idx < projects.length - 1" />
              </template>
            </FieldGroup>
            
            <div class="flex justify-end gap-2 mt-4">
              <Button type="button" @click="addEntry">{{ t('profile.add') || 'Add' }}</Button>
            </div>
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
            <Button type="button" @click="startEdit">{{ t('project.add') || 'Add project' }}</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
