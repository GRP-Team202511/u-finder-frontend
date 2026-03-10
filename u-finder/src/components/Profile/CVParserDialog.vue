<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const { t } = useI18n()

// Props
interface Props {
  open?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
})

// Emits
interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'parse-complete', data: any): void
}

const emit = defineEmits<Emits>()

// Local state
const isOpen = ref(props.open)

// Watch for prop changes
watch(() => props.open, (newVal) => {
  isOpen.value = newVal
})

// Update parent when local state changes
watch(isOpen, (newVal) => {
  emit('update:open', newVal)
})

// Close dialog
function closeDialog() {
  isOpen.value = false
}
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>{{ t('profile.cvParser.title') || 'Import from CV' }}</DialogTitle>
        <DialogDescription>
          {{ t('profile.cvParser.description') || 'Upload your CV to automatically fill in your profile information.' }}
        </DialogDescription>
      </DialogHeader>

      <!-- Placeholder content for now -->
      <div class="py-8 text-center text-muted-foreground">
        <p>CV upload interface will be implemented here.</p>
        <p class="text-sm mt-2">Supported formats: PDF, DOCX, DOC (max 10MB)</p>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="closeDialog">
          {{ t('profile.cancel') || 'Cancel' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
