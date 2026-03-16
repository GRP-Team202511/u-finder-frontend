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
import { ref, reactive, inject, onBeforeUnmount, onMounted } from 'vue'
import type { Ref } from 'vue'

type AwardEntry = {
  name: string
  description: string
}

const { t } = useI18n()

const props = defineProps<{
  class?: HTMLAttributes["class"]
  modelValue?: AwardEntry[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', payload: AwardEntry[]): void
  (e: 'save', payload: AwardEntry[]): void
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
const awards: Ref<AwardEntry[]> = ref(props.modelValue ? JSON.parse(JSON.stringify(props.modelValue)) : [
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
    name: awards.value.map(() => false)
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
      if (nv) awards.value = JSON.parse(JSON.stringify(nv))
      // Reset validation errors
      validationErrors.name = awards.value.map(() => false)
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
  awards.value.push({ name: '', description: '' })
  validationErrors.name.push(false)
}

function removeEntry(index: number) {
  awards.value.splice(index, 1)
  if (validationErrors.name.length > index) validationErrors.name.splice(index, 1)
}

function save(e?: Event) {
  if (e && e.preventDefault) e.preventDefault()

  // Remove untouched blank entries so users don't need to manually click Remove.
  awards.value = awards.value.filter((award) => {
    if (!award) return false
    return !isBlankValue(award.name) || !isBlankValue(award.description)
  })
  
  // Clear all validation errors first
  validationErrors.name = awards.value.map(() => false)
  
  // Validate required fields
  let hasError = false
  for (let i = 0; i < awards.value.length; i++) {
    const award = awards.value[i]
    if (!award) continue
    
    if (!award.name || !award.name.trim()) {
      validationErrors.name[i] = true
      hasError = true
      toast.error(t('award.validation.nameRequired') || `Award #${i + 1}: Award name is required`)
    }
  }
  
  if (hasError) {
    return
  }
  
  emit('save', JSON.parse(JSON.stringify(awards.value)))
  // Don't exit edit mode yet; wait for parent to confirm save success via modelValue update
  pendingSave.value = true
}

function cancel() {
  if (props.modelValue) awards.value = JSON.parse(JSON.stringify(props.modelValue))
  // Clear validation errors
  validationErrors.name = awards.value.map(() => false)
  emit('cancel')
  pendingSave.value = false
  localEditing.value = false
}

function startEdit() {
  localEditing.value = true
  // Ensure there's at least one entry to edit
  if (awards.value.length === 0) {
    awards.value.push({ name: '', description: '' })
    validationErrors.name.push(false)
  }
  emit('request-edit')
}

// register with parent profileEditor if available
onMounted(() => {
  if (profileEditor && typeof profileEditor.register === 'function') {
    const unregister = profileEditor.register({ save: () => save(), cancel: () => cancel(), isEditing: localEditing, el: cardRef })
    onBeforeUnmount(() => unregister())
  }
})
</script>

<template>
  <div ref="cardRef" :class="cn('flex flex-col gap-6', props.class)">
    <Card>
      <CardHeader class="text-left">
        <div class="flex items-center justify-between gap-4">
          <CardTitle class="text-3xl font-bold">
            {{ t('award.title') || 'award' }}
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
              <template v-for="(award, idx) in awards" :key="idx">
                <Field>
                  <FieldLabel :for="`name-${idx}`">{{ t('award.name') || 'name' }} <span class="text-red-500">*</span></FieldLabel>
                  <Input 
                    :id="`name-${idx}`" 
                    v-model="award.name" 
                    :placeholder="t('award.placeholders.name') || 'Award name'" 
                    :class="validationErrors.name[idx] && 'border-red-500'"
                    @input="clearError(idx, 'name')"
                  />
                </Field>
                <Field>
                  <FieldLabel :for="`description-${idx}`">{{ t('award.description') || 'Description' }}</FieldLabel>
                  <textarea
                    :id="`description-${idx}`"
                    v-model="award.description"
                    :placeholder="t('award.placeholders.description') || 'Description'"
                    rows="6"
                    class="w-full rounded-md border px-3 py-2 text-sm"
                  ></textarea>   
                </Field>
                <div class="flex justify-end gap-2 mt-2">
                  <Button type="button" variant="secondary" @click="removeEntry(idx)">{{ t('profile.remove') || 'Remove' }}</Button>
                </div>

                <FieldSeparator v-if="idx < awards.length - 1" />
              </template>
            </FieldGroup>
            
            <div class="flex justify-end gap-2 mt-4">
              <Button type="button" @click="addEntry">{{ t('profile.add') || 'Add' }}</Button>
            </div>
          </form>
        </div>
        <div v-else>
          <div v-if="awards && awards.length">
            <FieldGroup>
              <template v-for="(award, idx) in awards" :key="idx">
                <Field>
                  <FieldLabel>{{ t('award.name') || 'name' }}</FieldLabel>
                  <div class="text-sm text-left">{{ award.name || '-' }}</div>
                </Field>
                <Field>
                  <FieldLabel>{{ t('award.description') || 'Description' }}</FieldLabel>
                  <div class="text-sm text-left whitespace-pre-wrap break-words">{{ award.description || '-' }}</div>
                </Field>
              </template>
            </FieldGroup>
          </div>
          <div v-else class="text-center text-muted-foreground">
            <div class="mb-2">{{ t('award.empty') || 'No award' }}</div>
            <Button type="button" @click="startEdit">{{ t('award.add') || 'Add award' }}</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>