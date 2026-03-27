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
} from "@/components/ui/field"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { toast } from 'vue-sonner'
import { ref, reactive, inject, onBeforeUnmount, onMounted, watch } from 'vue'
import type { Ref } from 'vue'
import PatentFields from "./PatentFields.vue"
import ResearchPaperFields from "./ResearchPaperFields.vue"

type AcademicEntry = {
  type: "" | "research paper" | "patent"
  title?: string
  doi?: string
  abstract?: string
  patentNumber?: string
  region?: string
  description?: string
}

const { t } = useI18n()

const props = defineProps<{
  class?: HTMLAttributes["class"]
  modelValue?: AcademicEntry[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', payload: AcademicEntry[]): void
  (e: 'save', payload: AcademicEntry[]): void
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

function createEntryForType(type: AcademicEntry["type"]): AcademicEntry {
  if (type === "research paper") {
    return {
      type,
      title: '',
      doi: '',
      abstract: '',
    }
  }
  if (type === "patent") {
    return {
      type,
      title: '',
      patentNumber: '',
      region: '',
      description: '',
    }
  }
  return { type: '' }
}

// local draft state used while editing
const academicOutcomes: Ref<AcademicEntry[]> = ref(props.modelValue ? JSON.parse(JSON.stringify(props.modelValue)) : [
  createEntryForType('')
])

// validation error tracking for each entry
const validationErrors = reactive<{
  type: boolean[]
  title: boolean[]
}>(
  {
    type: academicOutcomes.value.map(() => false),
    title: academicOutcomes.value.map(() => false)
  }
)

// Clear validation error for a specific field
function clearError(index: number, field: 'type' | 'title') {
  validationErrors[field][index] = false
}

// when parent provides new modelValue, sync into local draft when not editing
watch(
  () => props.modelValue,
  (nv) => {
    if (!localEditing.value && nv) {
      academicOutcomes.value = JSON.parse(JSON.stringify(nv))
      // Reset validation errors
      validationErrors.type = academicOutcomes.value.map(() => false)
      validationErrors.title = academicOutcomes.value.map(() => false)
    } else if (pendingSave.value && nv) {
      // Save succeeded: parent updated modelValue, exit edit mode
      localEditing.value = false
      pendingSave.value = false
      emit('edit-complete')
    }
  },
  { deep: true }
)

function resetFieldsForType(index: number, nextType: AcademicEntry["type"]) {
  const current = academicOutcomes.value[index]
  if (current?.type === nextType) return
  academicOutcomes.value[index] = createEntryForType(nextType)
}

function typeLabel(type: AcademicEntry["type"]) {
  if (type === 'research paper') return t('academic.type.researchPaper')
  if (type === 'patent') return t('academic.type.patent')
  return '-'
}

function addEntry() {
  academicOutcomes.value.push(createEntryForType(''))
  validationErrors.type.push(false)
  validationErrors.title.push(false)
}

function removeEntry(index: number) {
  academicOutcomes.value.splice(index, 1)
  if (validationErrors.type.length > index) validationErrors.type.splice(index, 1)
  if (validationErrors.title.length > index) validationErrors.title.splice(index, 1)
}

function save(e?: Event) {
  if (e && e.preventDefault) e.preventDefault()

  // Remove untouched blank entries so users don't need to manually click Remove.
  academicOutcomes.value = academicOutcomes.value.filter((outcome) => {
    if (!outcome) return false
    if (outcome.type) return true
    const hasAnyField =
      !isBlankValue(outcome.title) ||
      !isBlankValue(outcome.doi) ||
      !isBlankValue(outcome.abstract) ||
      !isBlankValue(outcome.patentNumber) ||
      !isBlankValue(outcome.region) ||
      !isBlankValue(outcome.description)
    return hasAnyField
  })
  
  // Clear all validation errors first
  validationErrors.type = academicOutcomes.value.map(() => false)
  validationErrors.title = academicOutcomes.value.map(() => false)
  
  // Validate required fields
  let hasError = false
  for (let i = 0; i < academicOutcomes.value.length; i++) {
    const outcome = academicOutcomes.value[i]
    if (!outcome) continue
    
    if (!outcome.type) {
      validationErrors.type[i] = true
      hasError = true
      toast.error(t('academic.validation.typeRequired', { index: i + 1 }))
    } else if (!outcome.title || !outcome.title.trim()) {
      validationErrors.title[i] = true
      hasError = true
      if (!validationErrors.type[i]) {
        toast.error(t('academic.validation.titleRequired', { index: i + 1 }))
      }
    }
  }
  
  if (hasError) {
    return
  }
  
  emit('save', JSON.parse(JSON.stringify(academicOutcomes.value)))
  // Don't exit edit mode yet; wait for parent to confirm save success via modelValue update
  pendingSave.value = true
}

function cancel() {
  if (props.modelValue) academicOutcomes.value = JSON.parse(JSON.stringify(props.modelValue))
  // Clear validation errors
  validationErrors.type = academicOutcomes.value.map(() => false)
  validationErrors.title = academicOutcomes.value.map(() => false)
  emit('cancel')
  pendingSave.value = false
  localEditing.value = false
}

function startEdit() {
  localEditing.value = true
  profileEditor?.setActiveEl(cardRef.value)
  if (academicOutcomes.value.length === 0) {
    academicOutcomes.value.push(createEntryForType(''))
    validationErrors.type.push(false)
    validationErrors.title.push(false)
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
        <div class="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2">
          <CardTitle class="text-2xl font-bold sm:text-3xl">
            {{ t('academic.title') }}
          </CardTitle>
          <div v-if="!localEditing" class="flex justify-end">
            <Button type="button" @click="startEdit">{{ t('profile.edit') }}</Button>
          </div>
          <div v-else class="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <Button type="button" variant="secondary" @click="cancel">{{ t('profile.cancel') }}</Button>
            <Button type="button" @click="save">{{ t('profile.save') }}</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
          <div v-if="localEditing">
          <form @submit="save">
            <FieldGroup>
                <template v-for="(aca, idx) in academicOutcomes" :key="idx">
                <Field>
                    <FieldLabel :for="`type-${idx}`">{{ t('academic.type.title') }} <span class="text-red-500">*</span></FieldLabel>
                    <Select v-model="aca.type" @update:model-value="(val) => { resetFieldsForType(idx, (val ?? '') as AcademicEntry['type']); clearError(idx, 'type') }">
                    <SelectTrigger :id="`type-${idx}`" :class="cn('w-full', validationErrors.type[idx] && 'border-red-500')">
                        <SelectValue :placeholder="t('academic.selectType')" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="research paper">{{ t('academic.type.researchPaper') }}</SelectItem>
                        <SelectItem value="patent">{{ t('academic.type.patent') }}</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                  <div v-if="aca.type === 'research paper'" class="mt-2">
                    <ResearchPaperFields :entry="aca" :index="idx" :editable="true" :has-title-error="validationErrors.title[idx]" @clear-title-error="clearError(idx, 'title')" />
                  </div>
                  <div v-else-if="aca.type === 'patent'" class="mt-2">
                    <PatentFields :entry="aca" :index="idx" :editable="true" :has-title-error="validationErrors.title[idx]" @clear-title-error="clearError(idx, 'title')" />
                  </div>
                  <div v-else class="text-sm text-muted-foreground">
                    {{ t('academic.selectTypeHint') }}
                  </div>

                <div class="flex justify-end gap-2 mt-2">
                  <Button type="button" variant="secondary" @click="removeEntry(idx)">{{ t('profile.remove') }}</Button>
                </div>

                <hr v-if="idx < academicOutcomes.length - 1" class="my-6 border-t-2 border-muted-foreground/20" />
              </template>
            </FieldGroup>
            
            <div class="flex justify-end gap-2 mt-4">
              <Button type="button" @click="addEntry">{{ t('profile.add') }}</Button>
            </div>
          </form>
        </div>
        <div v-else>
          <div v-if="academicOutcomes && academicOutcomes.length">
            <FieldGroup>
              <template v-for="(aca, idx) in academicOutcomes" :key="idx">
                <Field>
                  <FieldLabel>{{ t('academic.type.title') }}</FieldLabel>
                  <div class="text-sm text-left">{{ typeLabel(aca.type) }}</div>
                </Field>

                <div v-if="aca.type === 'research paper'" class="mt-2">
                  <ResearchPaperFields :entry="aca" :index="idx" :editable="false" />
                </div>
                <div v-else-if="aca.type === 'patent'" class="mt-2">
                  <PatentFields :entry="aca" :index="idx" :editable="false" />
                </div>
                <div v-else class="text-sm text-muted-foreground">
                  -
                </div>

                <hr v-if="idx < academicOutcomes.length - 1" class="my-6 border-t-2 border-muted-foreground/20" />

              </template>
            </FieldGroup>
          </div>
          <div v-else class="text-center text-muted-foreground">
            <div class="mb-2">{{ t('academic.empty') }}</div>
            <Button type="button" @click="startEdit">{{ t('academic.add') }}</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>