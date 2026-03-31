<!-- This code was completed by GRP Team 2025.11. -->
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
import { toast } from 'vue-sonner'
import { ref, reactive, inject, onBeforeUnmount, onMounted, computed } from 'vue'
import type { Ref } from 'vue'

type CampusExpEntry = {
  name: string
  description: string
}

const { t } = useI18n()

const props = defineProps<{
  class?: HTMLAttributes["class"]
  modelValue?: CampusExpEntry[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', payload: CampusExpEntry[]): void
  (e: 'save', payload: CampusExpEntry[]): void
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

// local draft state used while editing
const campusExperience: Ref<CampusExpEntry[]> = ref(props.modelValue ? JSON.parse(JSON.stringify(props.modelValue)) : [
  {
    name: '',
    description: '',
  }
])

// validation error tracking for each entry
const validationErrors = reactive<{
  name: boolean[]
}>(
  {
    name: campusExperience.value.map(() => false)
  }
)

// Clear validation error for a specific field
function clearError(index: number, field: 'name') {
  validationErrors[field][index] = false
}

const hasFilledCampusExperience = computed(() =>
  campusExperience.value.some((exp) =>
    !isBlankValue(exp?.name) || !isBlankValue(exp?.description)
  )
)


// when parent provides new modelValue, sync into local draft when not editing
import { watch } from 'vue'
watch(
  () => props.modelValue,
  (nv) => {
    if (!localEditing.value) {
      if (nv) campusExperience.value = JSON.parse(JSON.stringify(nv))
      // Reset validation errors
      validationErrors.name = campusExperience.value.map(() => false)
    } else if (pendingSave.value && nv) {
      // Save succeeded: parent updated modelValue, exit edit mode
      localEditing.value = false
      pendingSave.value = false
      emit('edit-complete')
    }
  },
  { deep: true }
)


function addEntry() {
  campusExperience.value.push({ name: '', description: '' })
  validationErrors.name.push(false)
}

function removeEntry(index: number) {
  campusExperience.value.splice(index, 1)
  if (validationErrors.name.length > index) validationErrors.name.splice(index, 1)
}

function save(e?: Event) {
  if (e && e.preventDefault) e.preventDefault()

  // Remove untouched blank entries so users don't need to manually click Remove.
  campusExperience.value = campusExperience.value.filter((exp) => {
    if (!exp) return false
    return !isBlankValue(exp.name) || !isBlankValue(exp.description)
  })
  
  // Clear all validation errors first
  validationErrors.name = campusExperience.value.map(() => false)
  
  // Validate required fields
  let hasError = false
  for (let i = 0; i < campusExperience.value.length; i++) {
    const exp = campusExperience.value[i]
    if (!exp) continue
    
    if (!exp.name || !exp.name.trim()) {
      validationErrors.name[i] = true
      hasError = true
      toast.error(t('campusExp.validation.nameRequired', { index: i + 1 }))
    }
  }
  
  if (hasError) {
    return
  }
  
  emit('save', JSON.parse(JSON.stringify(campusExperience.value)))
  // Don't exit edit mode yet; wait for parent to confirm save success via modelValue update
  pendingSave.value = true
}

function cancel() {
  if (props.modelValue) campusExperience.value = JSON.parse(JSON.stringify(props.modelValue))
  // Clear validation errors
  validationErrors.name = campusExperience.value.map(() => false)
  emit('cancel')
  pendingSave.value = false
  localEditing.value = false
}

function startEdit() {
  localEditing.value = true
  profileEditor?.setActiveEl(cardRef.value)
  if (campusExperience.value.length === 0) {
    campusExperience.value.push({ name: '', description: '' })
    validationErrors.name.push(false)
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
            {{ t('campusExp.title') }}
          </CardTitle>
          <div v-if="!localEditing && hasFilledCampusExperience" class="flex justify-end">
            <Button type="button" @click="startEdit">{{ t('profile.edit') }}</Button>
          </div>
          <div v-else-if="localEditing" class="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <Button type="button" variant="secondary" @click="cancel">{{ t('profile.cancel') }}</Button>
            <Button type="button" @click="save">{{ t('profile.save') }}</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
          <div v-if="localEditing">
          <form @submit="save">
            <FieldGroup>
              <template v-for="(campusExp, idx) in campusExperience" :key="idx">
                <Field>
                  <FieldLabel :for="`name-${idx}`">{{ t('campusExp.name') }} <span class="text-red-500">*</span></FieldLabel>
                  <Input 
                    :id="`name-${idx}`" 
                    v-model="campusExp.name" 
                    :placeholder="t('campusExp.placeholders.name')" 
                    :class="validationErrors.name[idx] && 'border-red-500'"
                    @input="clearError(idx, 'name')"
                  />
                </Field>
                <Field>
                  <FieldLabel :for="`description-${idx}`">{{ t('campusExp.description') }}</FieldLabel>
                  <textarea
                    :id="`description-${idx}`"
                    v-model="campusExp.description"
                    :placeholder="t('campusExp.placeholders.description')"
                    rows="6"
                    class="w-full rounded-md border px-3 py-2 text-base md:text-sm"
                  ></textarea>                
                </Field>
                <div class="flex justify-end gap-2 mt-2">
                  <Button type="button" variant="secondary" @click="removeEntry(idx)">{{ t('profile.remove') }}</Button>
                </div>

                <hr v-if="idx < campusExperience.length - 1" class="my-6 border-t-2 border-muted-foreground/20" />
              </template>
            </FieldGroup>
            
            <div class="flex justify-end gap-2 mt-4">
              <Button type="button" @click="addEntry">{{ t('profile.add') }}</Button>
            </div>
          </form>
        </div>
        <div v-else>
          <div v-if="campusExperience && campusExperience.length">
            <FieldGroup>
              <template v-for="(campusExp, idx) in campusExperience" :key="idx">
                <Field>
                  <FieldLabel>{{ t('campusExp.name') }}</FieldLabel>
                  <div class="text-sm text-left">{{ campusExp.name || '-' }}</div>
                </Field>
                <Field>
                  <FieldLabel>{{ t('campusExp.description') }}</FieldLabel>
                  <div class="text-sm text-left whitespace-pre-wrap break-words">{{ campusExp.description || '-' }}</div>
                </Field>
                <hr v-if="idx < campusExperience.length - 1" class="my-6 border-t-2 border-muted-foreground/20" />
              </template>
            </FieldGroup>
          </div>
          <div v-else class="text-center text-muted-foreground">
            <div class="mb-2">{{ t('campusExp.empty') }}</div>
            <Button type="button" @click="startEdit">{{ t('campusExp.add') }}</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>