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
type ProfileEditor = {
  register: (h: { save: () => void; cancel?: () => void }) => () => void
}
const profileEditor = inject<ProfileEditor | null>('profileEditor', null)

// local edit state
const localEditing = ref(false)
const pendingSave = ref(false)

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
  if (type === 'research paper') return t('academic.type.researchPaper') || 'Research paper'
  if (type === 'patent') return t('academic.type.patent') || 'Patent'
  return '-'
}

function addEntry() {
  academicOutcomes.value.push(createEntryForType(''))
  validationErrors.type.push(false)
  validationErrors.title.push(false)
}

function removeEntry(index: number) {
  if (academicOutcomes.value.length > 1) academicOutcomes.value.splice(index, 1)
  if (validationErrors.type.length > index) validationErrors.type.splice(index, 1)
  if (validationErrors.title.length > index) validationErrors.title.splice(index, 1)
}

function save(e?: Event) {
  if (e && e.preventDefault) e.preventDefault()
  
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
      toast.error(t('academic.validation.typeRequired') || `Academic Outcome #${i + 1}: Type is required`)
    } else if (!outcome.title || !outcome.title.trim()) {
      validationErrors.title[i] = true
      hasError = true
      if (!validationErrors.type[i]) {
        toast.error(t('academic.validation.titleRequired') || `Academic Outcome #${i + 1}: Title is required`)
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
  // Ensure there's at least one entry to edit
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
            {{ t('academic.title') || 'Academic Outcome' }}
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
                <template v-for="(aca, idx) in academicOutcomes" :key="idx">
                <Field>
                    <FieldLabel :for="`type-${idx}`">{{ t('academic.type.title') || 'Type' }} <span class="text-red-500">*</span></FieldLabel>
                    <Select v-model="aca.type" @update:model-value="(val) => { resetFieldsForType(idx, (val ?? '') as AcademicEntry['type']); clearError(idx, 'type') }">
                    <SelectTrigger :id="`type-${idx}`" :class="cn('w-full', validationErrors.type[idx] && 'border-red-500')">
                        <SelectValue :placeholder="t('academic.selectType') || 'Select type'" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="research paper">{{ t('academic.type.researchPaper') || 'Research paper' }}</SelectItem>
                        <SelectItem value="patent">{{ t('academic.type.patent') || 'Patent' }}</SelectItem>
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
                    {{ t('academic.selectTypeHint') || 'Select a type to enter details.' }}
                  </div>

                <div v-if="academicOutcomes.length > 1" class="flex justify-end gap-2 mt-2">
                  <Button type="button" variant="secondary" @click="removeEntry(idx)">{{ t('profile.remove') || 'Remove' }}</Button>
                </div>

                <FieldSeparator v-if="idx < academicOutcomes.length - 1" />
              </template>
            </FieldGroup>
            
            <div class="flex justify-end gap-2 mt-4">
              <Button type="button" @click="addEntry">{{ t('profile.add') || 'Add' }}</Button>
            </div>
          </form>
        </div>
        <div v-else>
          <div v-if="academicOutcomes && academicOutcomes.length">
            <FieldGroup>
              <template v-for="(aca, idx) in academicOutcomes" :key="idx">
                <Field>
                  <FieldLabel>{{ t('academic.type.title') || 'Type' }}</FieldLabel>
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

              </template>
            </FieldGroup>
          </div>
          <div v-else class="text-center text-muted-foreground">
            <div class="mb-2">{{ t('academic.empty') || 'No academic outcomes' }}</div>
            <Button type="button" @click="startEdit">{{ t('academic.add') || 'Add academic outcome' }}</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
