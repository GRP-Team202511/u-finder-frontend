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
import { computed, ref, inject, onBeforeUnmount, onMounted, getCurrentInstance, watch } from 'vue'
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
  editable?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', payload: AcademicEntry[]): void
  (e: 'save', payload: AcademicEntry[]): void
  (e: 'cancel'): void
  (e: 'request-edit'): void
}>()

// participate in global profile edit/save/cancel via optional provided API
type ProfileEditor = {
  register: (h: { save: () => void; cancel?: () => void }) => () => void
}
const profileEditor = inject<ProfileEditor | null>('profileEditor', null)

// local edit state (used when parent does not control `editable`)
const localEditing = ref(false)
const instance = getCurrentInstance()
const hasEditableProp = computed(() => !!(instance?.vnode.props && Object.prototype.hasOwnProperty.call(instance.vnode.props, 'editable')))
const isEditable = computed(() => (hasEditableProp.value ? props.editable : localEditing.value))

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

// when parent provides new modelValue, sync into local draft when not editing
watch(
  () => props.modelValue,
  (nv) => {
    if (!isEditable.value && nv) academicOutcomes.value = JSON.parse(JSON.stringify(nv))
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
}

function removeEntry(index: number) {
  if (academicOutcomes.value.length > 1) academicOutcomes.value.splice(index, 1)
}

function save(e?: Event) {
  if (e && e.preventDefault) e.preventDefault()
  emit('update:modelValue', JSON.parse(JSON.stringify(academicOutcomes.value)))
  emit('save', JSON.parse(JSON.stringify(academicOutcomes.value)))
  if (!hasEditableProp.value) localEditing.value = false
}

function cancel() {
  if (props.modelValue) academicOutcomes.value = JSON.parse(JSON.stringify(props.modelValue))
  emit('cancel')
  if (!hasEditableProp.value) localEditing.value = false
}

function startEdit() {
  if (!hasEditableProp.value) localEditing.value = true
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
          <div v-if="!isEditable">
            <Button type="button" @click="startEdit">{{ t('profile.edit') || 'Edit' }}</Button>
          </div>
          <div v-else class="flex gap-2">
            <Button type="button" variant="secondary" @click="cancel">{{ t('profile.cancel') || 'Cancel' }}</Button>
            <Button type="button" @click="save">{{ t('profile.save') || 'Save' }}</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
          <div v-if="isEditable">
          <form @submit="save">
            <FieldGroup>
                <template v-for="(aca, idx) in academicOutcomes" :key="idx">
                <Field>
                    <FieldLabel :for="`type-${idx}`">{{ t('academic.type.title') || 'Type' }}</FieldLabel>
                    <Select v-model="aca.type" @update:model-value="(val) => resetFieldsForType(idx, (val ?? '') as AcademicEntry['type'])">
                    <SelectTrigger :id="`type-${idx}`" class="w-full">
                        <SelectValue :placeholder="t('academic.selectType') || 'Select type'" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="research paper">{{ t('academic.type.researchPaper') || 'Research paper' }}</SelectItem>
                        <SelectItem value="patent">{{ t('academic.type.patent') || 'Patent' }}</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                  <div v-if="aca.type === 'research paper'" class="mt-2">
                    <ResearchPaperFields :entry="aca" :index="idx" :editable="true" />
                  </div>
                  <div v-else-if="aca.type === 'patent'" class="mt-2">
                    <PatentFields :entry="aca" :index="idx" :editable="true" />
                  </div>
                  <div v-else class="text-sm text-muted-foreground">
                    {{ t('academic.selectTypeHint') || 'Select a type to enter details.' }}
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
            <Button type="button" @click="$emit('request-edit')">{{ t('academic.add') || 'Add academic outcome' }}</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
