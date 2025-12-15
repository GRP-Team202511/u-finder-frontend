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
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-vue-next'
import { ref, reactive } from 'vue'
import type { Ref } from 'vue'
import { Calendar } from '@/components/ui/calendar'
// (calendar value type will be treated as any to match calendar implementation)
import { DateFormatter, getLocalTimeZone, today } from '@internationalized/date'

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
}>()

const emit = defineEmits<{
  (e: 'update', payload: unknown): void
}>()

const education: Ref<EducationEntry[]> = ref([
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
const startDates = reactive<any[]>([undefined])
const endDates = reactive<any[]>([undefined])

const defaultPlaceholder = today(getLocalTimeZone())
const df = new DateFormatter('en-US', { dateStyle: 'long' })

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

function formatToMonth(dv: any, tz: string) {
  if (!dv) return ''
  // dv may be a DateValue-like object with toDate(tz)
  let dt: Date
  if (typeof dv.toDate === 'function') dt = dv.toDate(tz)
  else dt = new Date(dv)
  const m = dt.getMonth() + 1
  return `${dt.getFullYear()}-${m.toString().padStart(2, '0')}`
}

function save(e: Event) {
  e.preventDefault()
  // convert DateValue to YYYY-MM strings for storage
  const tz = getLocalTimeZone()
  const formatted = education.value.map((edu, i) => ({
    ...edu,
    time: {
      start: startDates[i] ? formatToMonth(startDates[i], tz) : edu.time.start,
      end: endDates[i] ? formatToMonth(endDates[i], tz) : edu.time.end,
    }
  }))
  emit('update', formatted)
}
</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <Card>
      <CardHeader class="text-left">
        <CardTitle class="text-3xl font-bold">
          {{ t("edu.title") }}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit="save">
          <FieldGroup>
            <template v-for="(edu, idx) in education" :key="idx">
              <Field>
                <FieldLabel :for="`type-${idx}`">{{ t('edu.type') || 'Type' }}</FieldLabel>
                <NativeSelect :id="`type-${idx}`" v-model="edu.type">
                  <NativeSelectOption value="high school">High School</NativeSelectOption>
                  <NativeSelectOption value="undergraduate">Undergraduate</NativeSelectOption>
                  <NativeSelectOption value="master">Master</NativeSelectOption>
                  <NativeSelectOption value="doctoral">Doctoral</NativeSelectOption>
                </NativeSelect>
              </Field>

              <Field>
                <FieldLabel :for="`name-${idx}`">{{ t('edu.institution') || 'Institution' }}</FieldLabel>
                <Input :id="`name-${idx}`" v-model="edu.name" placeholder="University name" />
              </Field>

              <div class="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel :for="`start-${idx}`">{{ t('edu.time.start') || 'Start' }}</FieldLabel>
                    <Popover v-slot="{ close }">
                      <PopoverTrigger as-child>
                        <Button variant="outline" :class="cn('w-full justify-start text-left font-normal', !edu.time.start && 'text-muted-foreground')">
                          <CalendarIcon class="mr-2 h-4 w-4" />
                          {{ startDates[idx] ? df.format(startDates[idx]!.toDate(getLocalTimeZone())) : (edu.time.start || 'Pick start') }}
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
                        {{ endDates[idx] ? df.format(endDates[idx]!.toDate(getLocalTimeZone())) : (edu.time.end || 'Pick end') }}
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
                <Input :id="`major-${idx}`" v-model="edu.major" placeholder="Computer Science" />
              </Field>

              <div class="grid grid-cols-3 gap-4">
                <Field>
                  <FieldLabel :for="`ranking-${idx}`">{{ t('edu.ranking') || 'Ranking' }}</FieldLabel>
                  <Input :id="`ranking-${idx}`" v-model="edu.ranking" placeholder="e.g. 5/200" />
                </Field>
                <Field>
                  <FieldLabel :for="`gpa-${idx}`">{{ t('edu.GPA') || 'GPA' }}</FieldLabel>
                  <Input :id="`gpa-${idx}`" v-model="edu.GPA" placeholder="3.8" />
                </Field>
                <Field>
                  <FieldLabel :for="`gpa-base-${idx}`">{{ t('edu.GPA-base') || 'GPA Base' }}</FieldLabel>
                  <Input :id="`gpa-base-${idx}`" v-model="edu.GPA_base" placeholder="4.0" />
                </Field>
              </div>

              <div class="flex justify-end gap-2 mt-2">
                <Button type="button" variant="destructive" @click="removeEntry(idx)">Remove</Button>
                <Button type="button" @click="addEntry">Add</Button>
              </div>

              <FieldSeparator />
            </template>

            <Field>
              <Button type="submit">{{ t('edu.save') || 'Save' }}</Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
