<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
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
import { ref, reactive, inject, onBeforeUnmount, onMounted, watch } from 'vue'
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

import { updatePersonalInfo } from '@/api/profileApi'
import type { PersonalInfo } from '@/types/profileTypes'
import { useUserStore } from '@/stores/userStore'

type BasicInfomationEntry = PersonalInfo

const { t } = useI18n()

const props = defineProps<{
  class?: HTMLAttributes["class"]
  modelValue?: BasicInfomationEntry
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', payload: BasicInfomationEntry): void
  (e: 'save', payload: BasicInfomationEntry): void
  (e: 'cancel'): void
  (e: 'request-edit'): void
  (e: 'edit-complete'): void
}>()

// participate in global profile edit/save/cancel via optional provided API
type ProfileEditor = {
  register: (h: { save: () => void; cancel?: () => void }) => () => void
}
const profileEditor = inject<ProfileEditor | null>('profileEditor', null)
const userStore = useUserStore()
const isLoading = ref(false)
const errorMessage = ref('')
const fieldErrors = reactive({
  name: '',
  gender: '',
  birthday: '',
})

// local edit state — used directly as the single source of truth for edit mode
const localEditing = ref(false)

// local draft state used while editing
const information: Ref<BasicInfomationEntry> = ref(
  props.modelValue
    ? JSON.parse(JSON.stringify(props.modelValue))
    : { name: '', gender: '', birthday: '' }
)
const committedInformation: Ref<BasicInfomationEntry> = ref(JSON.parse(JSON.stringify(information.value)))

// per-entry calendar values for calendar v-models (use `any` to match calendar implementation)
const birthday = ref<any>(undefined)

// initialize the `birthday` reactive array from `information` entries
async function initBirthdays() {
  try {
    birthday.value = await createDateValueFromYYYYMM(information.value.birthday || '')
  } catch (e) {
    birthday.value = undefined
  }
}

// when parent provides new modelValue, sync into local draft when not editing
watch(
  () => props.modelValue,
  async (nv) => {
    if (!localEditing.value) {
      const nextValue = nv ? JSON.parse(JSON.stringify(nv)) : { name: '', gender: '', birthday: '' }
      information.value = nextValue
      committedInformation.value = JSON.parse(JSON.stringify(nextValue))
      await initBirthdays()
    }
  },
  { deep: true }
)

const defaultPlaceholder = today(getLocalTimeZone())
const df = new DateFormatter('en-US', { dateStyle: 'medium' })

function genderLabel(gender: string) {
  if (!gender) return '-'
  if (gender.toLowerCase() === 'male') return t('info.gender.male')
  if (gender.toLowerCase() === 'female') return t('info.gender.female')
  if (gender.toLowerCase() === 'other') return t('info.gender.other')
  // Fallback: capitalize first letter of each word
  return gender.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
}

function getHttpErrorMessage(err: any, fallbackKey: string) {
  const status = err?.response?.status
  if (status === 401) return t('info.errors.unauthorized')
  if (status === 404) return t('info.errors.notFound')
  if (status === 500) return t('info.errors.serverError')
  return t(fallbackKey)
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

function clearFieldErrors() {
  fieldErrors.name = ''
  fieldErrors.gender = ''
  fieldErrors.birthday = ''
}

function save(e?: Event) {
  if (e && e.preventDefault) e.preventDefault()
  if (!localEditing.value || !userStore.isLoggedIn) {
    if (!userStore.isLoggedIn)
      errorMessage.value = t('info.errors.notLoggedIn')
    return
  }
  clearFieldErrors()
  errorMessage.value = ''

  const info = information.value || { name: '', gender: '', birthday: '' }
  const tz = getLocalTimeZone()
  const birthdayValue = birthday.value ? formatToDate(birthday.value, tz) : (info.birthday || '')
  const nameValue = (info.name || '').trim()
  const genderValue = info.gender || ''

  if (!nameValue) fieldErrors.name = t('info.errors.nameRequired')
  if (fieldErrors.name) return

  isLoading.value = true
  // Explicitly construct payload with only the three required fields per API spec
  const payload: PersonalInfo = {
    name: nameValue,
    gender: genderValue,
    birthday: birthdayValue,
  }
  updatePersonalInfo(payload)
    .then(() => {
      // Use local payload as source of truth since the API only returns { message }
      information.value = JSON.parse(JSON.stringify(payload))
      committedInformation.value = JSON.parse(JSON.stringify(payload))
      emit('update:modelValue', JSON.parse(JSON.stringify(payload)))
      emit('save', JSON.parse(JSON.stringify(payload)))
      localEditing.value = false
      emit('edit-complete')
      toast.success(t('profile.toast.information.saveSuccess'))
    })
    .catch((err) => {
      errorMessage.value = getHttpErrorMessage(err, 'info.errors.saveFailed')
      toast.error(t('profile.toast.information.saveFailed'))
    })
    .finally(() => {
      isLoading.value = false
    })
}

function cancel() {
  // discard drafts and restore last committed state
  information.value = JSON.parse(JSON.stringify(committedInformation.value))
  initBirthdays()
  emit('cancel')
  errorMessage.value = ''
  clearFieldErrors()
  localEditing.value = false
}

function startEdit() {
  // enter edit mode
  localEditing.value = true
  clearFieldErrors()
  errorMessage.value = ''
  emit('request-edit')
}

// register with parent profileEditor if available
onMounted(async () => {
  await initBirthdays()
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
            {{ t("info.title") }}
          </CardTitle>
          <div v-if="!localEditing">
            <Button type="button" :disabled="isLoading" @click="startEdit">{{ t('profile.edit') }}</Button>
          </div>
          <div v-else class="flex gap-2">
            <Button type="button" variant="secondary" :disabled="isLoading" @click="cancel">{{ t('profile.cancel') }}</Button>
            <Button type="button" :disabled="isLoading" @click="save">{{ t('profile.save') }}</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
          <div v-if="errorMessage" class="text-sm text-destructive mb-2">{{ errorMessage }}</div>
          <div v-if="localEditing">
          <form @submit="save">
            <FieldGroup>
              <Field>
                <FieldLabel for="name">{{ t('info.name') }}</FieldLabel>
                <Input id="name" v-model="information.name" placeholder="Name" />
                <div v-if="fieldErrors.name" class="text-xs text-destructive mt-1">{{ fieldErrors.name }}</div>
              </Field>

              <Field>
                <FieldLabel for="gender">{{ t('info.gender.title') }}</FieldLabel>
                <Select v-model="information.gender">
                  <SelectTrigger id="gender" class="w-full">
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{{ t('info.gender.male') }}</SelectItem>
                    <SelectItem value="female">{{ t('info.gender.female') }}</SelectItem>
                    <SelectItem value="other">{{ t('info.gender.other') }}</SelectItem>
                  </SelectContent>
                </Select>
                <div v-if="fieldErrors.gender" class="text-xs text-destructive mt-1">{{ fieldErrors.gender }}</div>
              </Field>

              <Field>
                <FieldLabel for="birthday">{{ t('info.birthday') }}</FieldLabel>
                <Popover v-slot="{ close }">
                  <PopoverTrigger as-child>
                    <Button variant="outline" :class="cn('w-full justify-start text-left font-normal', !information.birthday && 'text-muted-foreground')">
                      <CalendarIcon class="mr-2 h-4 w-4" />
                      {{ birthday ? df.format(birthday!.toDate(getLocalTimeZone())) : (information.birthday || t('date.pickDate')) }}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent class="w-auto p-0" align="start">
                    <Calendar
                      v-model="birthday"
                      :default-placeholder="defaultPlaceholder"
                      :max-value="defaultPlaceholder"
                      layout="month-and-year"
                      initial-focus
                      @update:model-value="close"
                    />
                  </PopoverContent>
                </Popover>
                <div v-if="fieldErrors.birthday" class="text-xs text-destructive mt-1">{{ fieldErrors.birthday }}</div>
              </Field>
            </FieldGroup>
          </form>
        </div>
        <div v-else>
          <div v-if="information">
            <FieldGroup>
              <Field>
                <FieldLabel>{{ t('info.name') }}</FieldLabel>
                <div class="text-sm text-left">{{ information.name || '-' }}</div>
              </Field>

              <Field>
                <FieldLabel>{{ t('info.gender.title') }}</FieldLabel>
                <div class="text-sm text-left">{{ genderLabel(information.gender) }}</div>
              </Field>

              <Field>
                <FieldLabel>{{ t('info.birthday') }}</FieldLabel>
                <div class="text-sm text-left">{{ birthday ? df.format(birthday!.toDate(getLocalTimeZone())) : (information.birthday || '-') }}</div>
              </Field>
            </FieldGroup>
          </div>
          <div v-else class="text-center text-muted-foreground">
            <div class="mb-2">{{ t('info.empty') }}</div>
            <Button type="button" @click="startEdit">{{ t('info.add') }}</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
