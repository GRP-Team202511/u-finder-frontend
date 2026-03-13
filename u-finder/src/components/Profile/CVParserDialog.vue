<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import axios from 'axios'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { uploadCV } from '@/api/profileApi'
import type { CVParseResponse } from '@/types/profileTypes'

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
  (e: 'parse-complete', data: CVParseResponse): void
}

const emit = defineEmits<Emits>()

// Local state
const isOpen = ref(props.open)
const isDragging = ref(false)
const isUploading = ref(false)
const isParsing = ref(false)
const selectedFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
// Holds the controller for the current in-flight upload so we can abort it on demand
const abortController = ref<AbortController | null>(null)

// Accepted file types
const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
]
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// Watch for prop changes
watch(() => props.open, (newVal) => {
  isOpen.value = newVal
  if (newVal) {
    // Reset state when dialog opens
    resetState()
  }
})

// Update parent when local state changes
watch(isOpen, (newVal) => {
  emit('update:open', newVal)
})

// Reset state
function resetState() {
  selectedFile.value = null
  isUploading.value = false
  isParsing.value = false
  isDragging.value = false
  abortController.value = null
}

// Abort the in-flight request and return to the file-selection state
function cancelUpload() {
  abortController.value?.abort()
  // resetState is called in the catch block once the CanceledError is received
}

// Close dialog — abort any in-flight request first so it doesn't linger
function closeDialog() {
  if (isUploading.value || isParsing.value) {
    cancelUpload()
  }
  isOpen.value = false
}

// Trigger file input
function triggerFileInput() {
  fileInputRef.value?.click()
}

// Handle file selection
function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    validateAndUploadFile(file)
  }
}

// Handle drag events
function handleDragOver(event: DragEvent) {
  event.preventDefault()
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false
  
  const file = event.dataTransfer?.files[0]
  if (file) {
    validateAndUploadFile(file)
  }
}

// Validate and upload file
async function validateAndUploadFile(file: File) {
  // Check file type
  if (!ACCEPTED_TYPES.includes(file.type)) {
    toast.error(t('profile.cvParser.errors.invalidFormat') || 'Invalid file format. Only PDF, DOCX, and DOC are supported.')
    return
  }
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    toast.error(t('profile.cvParser.errors.fileTooLarge') || 'File size exceeds 10MB limit.')
    return
  }
  
  selectedFile.value = file
  await uploadFile(file)
}

// Upload file
async function uploadFile(file: File) {
  // Create a fresh controller for this upload so previous aborts don't carry over
  abortController.value = new AbortController()

  isUploading.value = true
  isParsing.value = false

  try {
    // File is already in the browser — transition straight to the AI-parsing wait state
    isUploading.value = false
    isParsing.value = true

    const response = await uploadCV(file, abortController.value.signal)

    // Success
    isParsing.value = false
    toast.success(t('profile.cvParser.parseSuccess') || 'CV parsed successfully!')

    // Emit parse complete event with data
    emit('parse-complete', response.data)

    // Close dialog after success
    setTimeout(() => {
      isOpen.value = false
    }, 500)

  } catch (error: any) {
    isUploading.value = false
    isParsing.value = false

    // User explicitly cancelled — reset silently without an error toast
    if (axios.isCancel(error)) {
      console.info('CV upload cancelled by user')
      resetState()
      return
    }

    // Client-side timeout (ECONNABORTED) — different message from a generic server error
    if (error.code === 'ECONNABORTED') {
      toast.error(
        t('profile.cvParser.errors.timeout') ||
        'Parsing timed out. The file may be too complex — please try again.'
      )
      console.error('CV upload timed out:', error)
      return
    }

    // HTTP error — map status codes to user-friendly messages
    const status = error.response?.status
    let errorMessage = t('profile.cvParser.errors.uploadFailed') || 'Failed to upload CV. Please try again.'

    switch (status) {
      case 400:
        errorMessage = t('profile.cvParser.errors.noFile') || 'No file uploaded or file is empty.'
        break
      case 401:
        errorMessage = t('profile.cvParser.errors.unauthorized') || 'You are not authorized. Please login again.'
        break
      case 413:
        errorMessage = t('profile.cvParser.errors.fileTooLarge') || 'File size exceeds 10MB limit.'
        break
      case 415:
        errorMessage = t('profile.cvParser.errors.invalidFormat') || 'Unsupported file format. Only PDF and DOCX are allowed.'
        break
      case 422:
        errorMessage = t('profile.cvParser.errors.parseFailed') || 'Failed to extract information from the uploaded file.'
        break
      case 502:
        errorMessage = t('profile.cvParser.errors.serviceUnavailable') || 'AI service is temporarily unavailable. Please try again later.'
        break
      case 500:
      default:
        errorMessage = t('profile.cvParser.errors.serverError') || 'Internal server error. Please try again.'
        break
    }

    toast.error(errorMessage)
    console.error('Failed to upload CV:', error)
  }
}

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
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

      <!-- Upload State -->
      <div v-if="!isUploading && !isParsing" class="py-8">
        <!-- File Drop Zone -->
        <div
          class="border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer"
          :class="{
            'border-primary bg-primary/5': isDragging,
            'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50': !isDragging
          }"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          @drop="handleDrop"
          @click="triggerFileInput"
        >
          <svg
            class="mx-auto h-12 w-12 text-muted-foreground"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <p class="mt-4 text-sm font-medium">
            {{ t('profile.cvParser.uploadPrompt') || 'Drag and drop your CV here, or click to select a file' }}
          </p>
          <p class="mt-2 text-xs text-muted-foreground">
            {{ t('profile.cvParser.supportedFormats') || 'Supported formats: PDF, DOCX, DOC' }}
          </p>
          <p class="text-xs text-muted-foreground">
            {{ t('profile.cvParser.maxSize') || 'Maximum file size: 10MB' }}
          </p>
        </div>
        
        <!-- Hidden file input -->
        <input
          ref="fileInputRef"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          class="hidden"
          @change="handleFileSelect"
        />
      </div>

      <!-- Uploading State -->
      <div v-else-if="isUploading" class="py-12 text-center">
        <Spinner class="mx-auto h-12 w-12 text-primary" />
        <p class="mt-4 text-sm font-medium">
          {{ t('profile.cvParser.uploading') || 'Uploading...' }}
        </p>
        <p v-if="selectedFile" class="mt-2 text-xs text-muted-foreground">
          {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
        </p>
      </div>

      <!-- Parsing State -->
      <div v-else-if="isParsing" class="py-12 text-center">
        <Spinner class="mx-auto h-12 w-12 text-primary" />
        <p class="mt-4 text-sm font-medium">
          {{ t('profile.cvParser.parsing') || 'Parsing your CV...' }}
        </p>
        <p class="mt-2 text-xs text-muted-foreground">
          {{ t('profile.cvParser.parsingHint') || 'This may take up to 1 minute for complex documents.' }}
        </p>
      </div>

      <DialogFooter>
        <!-- During parsing the button cancels the in-flight request instead of just closing -->
        <Button
          variant="outline"
          @click="isParsing || isUploading ? cancelUpload() : closeDialog()"
          :disabled="false"
        >
          {{ t('profile.cancel') || 'Cancel' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
