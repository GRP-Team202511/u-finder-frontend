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
import { computed, ref, inject, onBeforeUnmount, onMounted } from 'vue'
import type { Ref } from 'vue'

type CampusExpEntry = {
  name: string
  description: string
}

const { t } = useI18n()

const props = defineProps<{
  class?: HTMLAttributes["class"]
  modelValue?: CampusExpEntry[]
  editable?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', payload: CampusExpEntry[]): void
  (e: 'save', payload: CampusExpEntry[]): void
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
const isEditable = computed(() => (props.editable !== undefined ? props.editable : localEditing.value))

// local draft state used while editing
const campusExperience: Ref<CampusExpEntry[]> = ref(props.modelValue ? JSON.parse(JSON.stringify(props.modelValue)) : [
  {
    name: '',
    description: '',
  }
])


// when parent provides new modelValue, sync into local draft when not editing
import { watch } from 'vue'
watch(
  () => props.modelValue,
  (nv) => {
    if (!isEditable.value) {
      if (nv) campusExperience.value = JSON.parse(JSON.stringify(nv))
    }
  },
  { deep: true }
)


function addEntry() {
  campusExperience.value.push({ name: '', description: '' })
}

function removeEntry(index: number) {
  if (campusExperience.value.length > 1) campusExperience.value.splice(index, 1)
}

function save(e?: Event) {
  if (e && e.preventDefault) e.preventDefault()
  emit('update:modelValue', JSON.parse(JSON.stringify(campusExperience.value)))
  emit('save', JSON.parse(JSON.stringify(campusExperience.value)))
  if (props.editable === undefined) localEditing.value = false
}

function cancel() {
  if (props.modelValue) campusExperience.value = JSON.parse(JSON.stringify(props.modelValue))
  emit('cancel')
  if (props.editable === undefined) localEditing.value = false
}

function startEdit() {
  if (props.editable === undefined) localEditing.value = true
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
            {{ t('campusExp.title') || 'campusExp' }}
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
              <template v-for="(campusExp, idx) in campusExperience" :key="idx">
                <Field>
                  <FieldLabel :for="`name-${idx}`">{{ t('campusExp.name') || 'name' }}</FieldLabel>
                  <Input :id="`name-${idx}`" v-model="campusExp.name" placeholder="Campus Experience" />
                </Field>
                <Field>
                  <FieldLabel :for="`description-${idx}`">{{ t('campusExp.description') || 'Description' }}</FieldLabel>
                  <textarea
                    :id="`description-${idx}`"
                    v-model="campusExp.description"
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
          <div v-if="campusExperience && campusExperience.length">
            <FieldGroup>
              <template v-for="(campusExp, idx) in campusExperience" :key="idx">
                <Field>
                  <FieldLabel>{{ t('campusExp.name') || 'name' }}</FieldLabel>
                  <div class="text-sm text-left">{{ campusExp.name || '-' }}</div>
                </Field>
                <Field>
                  <FieldLabel>{{ t('campusExp.description') || 'Description' }}</FieldLabel>
                  <div class="text-sm text-left whitespace-pre-wrap break-words">{{ campusExp.description || '-' }}</div>
                </Field>
              </template>
            </FieldGroup>
          </div>
          <div v-else class="text-center text-muted-foreground">
            <div class="mb-2">{{ t('campusExp.empty') || 'No campusExp' }}</div>
            <Button type="button" @click="$emit('request-edit')">{{ t('campusExp.add') || 'Add campusExp' }}</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
