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
import { computed, ref, reactive, inject, onBeforeUnmount, onMounted, getCurrentInstance } from 'vue'
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

import { updatePersonalInfo } from '@/api/userApi'
import type { PersonalInfo } from '@/api/userApi'
import { useUserStore } from '@/stores/userStore'

type BasicInfomationEntry = PersonalInfo

const { t } = useI18n()

const props = defineProps<{
  class?: HTMLAttributes["class"]
  modelValue?: BasicInfomationEntry[]
  editable?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', payload: BasicInfomationEntry[]): void
  (e: 'save', payload: BasicInfomationEntry[]): void
  (e: 'cancel'): void
  (e: 'request-edit'): void
}>()

// participate in global profile edit/save/cancel via optional provided API
type ProfileEditor = {
  register: (h: { save: () => void; cancel?: () => void }) => () => void
}
const profileEditor = inject<ProfileEditor | null>('profileEditor', null)
const userStore = useUserStore()
const token = computed(() => userStore.user?.token || '')
const isLoading = ref(false)
const errorMessage = ref('')
const fieldErrors = reactive({
  name: '',
  gender: '',
  birthday: '',
})

// local edit state (used when parent does not control `editable`)
const localEditing = ref(false)
const instance = getCurrentInstance()
const hasEditableProp = computed(() => !!(instance?.vnode.props && Object.prototype.hasOwnProperty.call(instance.vnode.props, 'editable')))
const isEditable = computed(() => (hasEditableProp.value ? props.editable : localEditing.value))

// local draft state used while editing
const information: Ref<BasicInfomationEntry[]> = ref(props.modelValue ? JSON.parse(JSON.stringify(props.modelValue)) : [
  {
    name: '',
    gender: '',
    birthday: '',
  }
])
const committedInformation: Ref<BasicInfomationEntry[]> = ref(JSON.parse(JSON.stringify(information.value)))

// per-entry calendar values for calendar v-models (use `any` to match calendar implementation)
const birthday = reactive<any[]>([])

// initialize the `birthday` reactive array from `information` entries
async function initBirthdays() {
  const arr = await Promise.all(
    information.value.map(async (info) => {
      try {
        return await createDateValueFromYYYYMM(info.birthday || '')
      } catch (e) {
        return undefined
      }
    })
  )
  birthday.splice(0, birthday.length, ...arr)
}

// when parent provides new modelValue, sync into local draft when not editing
import { watch } from 'vue'
watch(
  () => props.modelValue,
  async (nv) => {
    if (!isEditable.value) {
      const nextValue = nv ? JSON.parse(JSON.stringify(nv)) : [ { name: '', gender: '', birthday: '' } ]
      information.value = nextValue
      committedInformation.value = JSON.parse(JSON.stringify(nextValue))
      await initBirthdays()
    }
  },
  { deep: true }
)

const defaultPlaceholder = today(getLocalTimeZone())
const df = new DateFormatter('en-US', { dateStyle: 'long' })

function getHttpErrorMessage(err: any, fallbackKey: string) {
  const status = err?.response?.status
  if (status === 401) return t('info.errors.unauthorized') || 'Invalid or expired token.'
  if (status === 404) return t('info.errors.notFound') || 'User not found.'
  if (status === 500) return t('info.errors.serverError') || 'Internal server error.'
  return t(fallbackKey) || ''
}

function addEntry() {
  information.value.push({ name: '', gender: '', birthday:'' })
  birthday.push(undefined)
}

function removeEntry(index: number) {
  if (information.value.length > 1) information.value.splice(index, 1)
  if (birthday.length > index) birthday.splice(index, 1)
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

function clearFieldErrors() {
  fieldErrors.name = ''
  fieldErrors.gender = ''
  fieldErrors.birthday = ''
}

function save(e?: Event) {
  if (e && e.preventDefault) e.preventDefault()
  if (!token.value) {
    errorMessage.value = t('info.errors.notLoggedIn') || 'You are not logged in.'
    return
  }
  clearFieldErrors()
  errorMessage.value = ''

  const info = information.value[0] || { name: '', gender: '', birthday: '' }
  const tz = getLocalTimeZone()
  const birthdayValue = birthday[0] ? formatToMonth(birthday[0], tz) : info.birthday
  const nameValue = (info.name || '').trim()
  const genderValue = info.gender || ''

  if (!nameValue) fieldErrors.name = t('info.errors.nameRequired') || 'Name is required.'
  if (!genderValue) fieldErrors.gender = t('info.errors.genderRequired') || 'Gender is required.'
  if (!birthdayValue) fieldErrors.birthday = t('info.errors.birthdayRequired') || 'Birthday is required.'
  if (fieldErrors.name || fieldErrors.gender || fieldErrors.birthday) return

  isLoading.value = true
  const payload = {
    ...info,
    name: nameValue,
    gender: genderValue,
    birthday: birthdayValue,
  }
  updatePersonalInfo(payload, token.value)
    .then((res) => {
      const updated = [res.data]
      information.value = JSON.parse(JSON.stringify(updated))
      committedInformation.value = JSON.parse(JSON.stringify(updated))
      emit('update:modelValue', JSON.parse(JSON.stringify(updated)))
      emit('save', JSON.parse(JSON.stringify(updated)))
      if (!hasEditableProp.value) localEditing.value = false
    })
    .catch((err) => {
      errorMessage.value = getHttpErrorMessage(err, 'info.errors.saveFailed') || 'Failed to save personal information.'
    })
    .finally(() => {
      isLoading.value = false
    })
}

function cancel() {
  // discard drafts and notify parent
  information.value = JSON.parse(JSON.stringify(committedInformation.value))
  // reinitialize birthday values from restored information
  initBirthdays()
  emit('cancel')
  errorMessage.value = ''
  clearFieldErrors()
  if (!hasEditableProp.value) localEditing.value = false
}

function startEdit() {
  if (!hasEditableProp.value) localEditing.value = true
  clearFieldErrors()
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
          <div v-if="!isEditable">
            <Button type="button" :disabled="isLoading" @click="startEdit">{{ t('profile.edit') || 'Edit' }}</Button>
          </div>
          <div v-else class="flex gap-2">
            <Button type="button" variant="secondary" :disabled="isLoading" @click="cancel">{{ t('profile.cancel') || 'Cancel' }}</Button>
            <Button type="button" :disabled="isLoading" @click="save">{{ t('profile.save') || 'Save' }}</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
          <div v-if="errorMessage" class="text-sm text-destructive mb-2">{{ errorMessage }}</div>
          <div v-if="isEditable">
          <form @submit="save">
            <FieldGroup>
              <template v-for="(info, idx) in information" :key="idx">
                <Field>
                  <FieldLabel :for="`name-${idx}`">{{ t('info.name') || 'Name' }}</FieldLabel>
                  <Input :id="`name-${idx}`" v-model="info.name" placeholder="Name" />
                  <div v-if="fieldErrors.name" class="text-xs text-destructive mt-1">{{ fieldErrors.name }}</div>
                </Field>

                <Field>
                  <FieldLabel :for="`gender-${idx}`">{{ t('info.gender.title') || 'Gender' }}</FieldLabel>
                  <Select v-model="info.gender">
                    <SelectTrigger :id="`gender-${idx}`" class="w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{{ t('info.gender.male') || 'Male' }}</SelectItem>
                      <SelectItem value="female">{{ t('info.gender.female') || 'Female' }}</SelectItem>
                      <SelectItem value="other">{{ t('info.gender.other') || 'Other' }}</SelectItem>
                    </SelectContent>
                  </Select>
                  <div v-if="fieldErrors.gender" class="text-xs text-destructive mt-1">{{ fieldErrors.gender }}</div>
                </Field>

                <Field>
                  <FieldLabel :for="`birthday-${idx}`">{{ t('info.birthday') || 'Birthday' }}</FieldLabel>
                  <Popover v-slot="{ close }">
                    <PopoverTrigger as-child>
                      <Button variant="outline" :class="cn('w-full justify-start text-left font-normal', !info.birthday && 'text-muted-foreground')">
                        <CalendarIcon class="mr-2 h-4 w-4" />
                        {{ birthday[idx] ? df.format(birthday[idx]!.toDate(getLocalTimeZone())) : (info.birthday || 'Pick date') }}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent class="w-auto p-0" align="start">
                      <Calendar
                        v-model="birthday[idx]"
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
              </template>
            </FieldGroup>
          </form>
        </div>
        <div v-else>
          <div v-if="information && information.length">
            <FieldGroup>
              <template v-for="(info, idx) in information" :key="idx">
                <Field>
                  <FieldLabel>{{ t('info.name') || 'Name' }}</FieldLabel>
                  <div class="text-sm text-left">{{ info.name || '-' }}</div>
                </Field>

                <Field>
                  <FieldLabel>{{ t('info.gender.title') || 'Gender' }}</FieldLabel>
                  <div class="text-sm text-left">{{ info.gender || '-' }}</div>
                </Field>

                <Field>
                  <FieldLabel>{{ t('info.birthday') || 'Birthday' }}</FieldLabel>
                  <div class="text-sm text-left">{{ birthday[idx] ? df.format(birthday[idx]!.toDate(getLocalTimeZone())) : (info.birthday || '-') }}</div>
                </Field>
              </template>
            </FieldGroup>
          </div>
          <div v-else class="text-center text-muted-foreground">
            <div class="mb-2">{{ t('info.empty') || 'No information records' }}</div>
            <Button type="button" @click="$emit('request-edit')">{{ t('info.add') || 'Add information' }}</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
