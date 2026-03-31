<!-- This code was completed by GRP Team 2025.11. -->
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
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
import { Progress } from '@/components/ui/progress'
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
const isParseSuccess = ref(false)
const selectedFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
// Holds the controller for the current in-flight upload so we can abort it on demand
const abortController = ref<AbortController | null>(null)

// Simulated parsing progress (0-100)
const parseProgress = ref(0)
// Interval timer driving the fake progress animation
let progressTimer: ReturnType<typeof setInterval> | null = null

// Maps the current progress value to a phase-specific hint i18n key
const parsingHintKey = computed(() => {
  if (parseProgress.value < 30) return 'profile.cvParser.parsingStep1'
  if (parseProgress.value < 70) return 'profile.cvParser.parsingStep2'
  return 'profile.cvParser.parsingStep3'
})

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
  isParseSuccess.value = false
  isDragging.value = false
  abortController.value = null
  stopParsingProgress(false)
}

// Start the simulated progress animation when parsing begins
function startParsingProgress() {
  parseProgress.value = 0
  progressTimer = setInterval(() => {
    const current = parseProgress.value
    if (current < 30) {
      // Phase 1: fast ramp-up (0 → 30 in ~3 s at 200 ms interval)
      parseProgress.value = Math.min(30, current + 2)
    } else if (current < 85) {
      // Phase 2: slow creep (30 → 85 in ~22 s)
      parseProgress.value = Math.min(85, current + 0.5)
    } else if (current < 95) {
      // Phase 3: very slow crawl (85 → 95 in ~40 s) — nearly stalls to hint at completion
      parseProgress.value = Math.min(95, current + 0.2)
    }
  }, 200)
}

// Stop the progress animation; jump to 100 on success or reset to 0 on failure
function stopParsingProgress(success: boolean) {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
  parseProgress.value = success ? 100 : 0
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
    toast.error(t('profile.cvParser.errors.invalidFormat'))
    return
  }
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    toast.error(t('profile.cvParser.errors.fileTooLarge'))
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
    startParsingProgress()

    const response = await uploadCV(file, abortController.value.signal)

    // Success — jump progress bar to 100% and trigger the checkmark animation
    stopParsingProgress(true)
    isParsing.value = false
    isParseSuccess.value = true

    // Wait for the success animation to finish (circle ~0.5 s + check ~0.4 s + hold) before navigating
    await new Promise<void>(resolve => setTimeout(resolve, 1400))

    toast.success(t('profile.cvParser.parseSuccess'))
    emit('parse-complete', response.data)
    isOpen.value = false

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
      toast.error(t('profile.cvParser.errors.timeout'))
      console.error('CV upload timed out:', error)
      return
    }

    // HTTP error — map status codes to user-friendly messages
    const status = error.response?.status
    let errorMessage = t('profile.cvParser.errors.uploadFailed')

    switch (status) {
      case 400:
        errorMessage = t('profile.cvParser.errors.noFile')
        break
      case 401:
        errorMessage = t('profile.cvParser.errors.unauthorized')
        break
      case 413:
        errorMessage = t('profile.cvParser.errors.fileTooLarge')
        break
      case 415:
        errorMessage = t('profile.cvParser.errors.invalidFormat')
        break
      case 422:
        errorMessage = t('profile.cvParser.errors.parseFailed')
        break
      case 502:
        errorMessage = t('profile.cvParser.errors.serviceUnavailable')
        break
      case 500:
      default:
        errorMessage = t('profile.cvParser.errors.serverError')
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
        <DialogTitle>{{ t('profile.cvParser.title') }}</DialogTitle>
        <DialogDescription>
          {{ t('profile.cvParser.description') }}
        </DialogDescription>
      </DialogHeader>

      <!-- Upload State -->
      <div v-if="!isUploading && !isParsing && !isParseSuccess" class="py-8">
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
            {{ t('profile.cvParser.uploadPrompt') }}
          </p>
          <p class="mt-2 text-xs text-muted-foreground">
            {{ t('profile.cvParser.supportedFormats') }}
          </p>
          <p class="text-xs text-muted-foreground">
            {{ t('profile.cvParser.maxSize') }}
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
          {{ t('profile.cvParser.uploading') }}
        </p>
        <p v-if="selectedFile" class="mt-2 text-xs text-muted-foreground">
          {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
        </p>
      </div>

      <!-- Parsing State -->
      <div v-else-if="isParsing && !isParseSuccess" class="py-8 text-center">
        <p class="text-sm font-medium mb-4">
          {{ t('profile.cvParser.parsing') }}
        </p>
        <!-- Simulated progress bar: animates from 0 to 85% while waiting, then jumps to 100% on success -->
        <Progress :model-value="parseProgress" class="h-2 mb-2" />
        <div class="flex justify-between items-center mt-1 mb-3">
          <span class="text-xs text-muted-foreground">{{ t(parsingHintKey) }}</span>
          <span class="text-xs text-muted-foreground">{{ Math.round(parseProgress) }}%</span>
        </div>
        <p class="text-xs text-muted-foreground">
          {{ t('profile.cvParser.parsingHint') }}
        </p>
      </div>

      <!-- Success Animation State: shown after server responds, before navigating to results -->
      <div v-else-if="isParseSuccess" class="py-10 text-center">
        <svg class="mx-auto h-16 w-16 text-primary" viewBox="0 0 52 52" fill="none" aria-hidden="true">
          <!-- Circle draws itself over 0.5 s -->
          <circle
            cx="26" cy="26" r="24"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-dasharray="151"
            class="success-circle"
          />
          <!-- Checkmark draws after the circle, with 0.4 s delay -->
          <path
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M14 27l8 8 16-16"
            stroke-dasharray="36"
            class="success-check"
          />
        </svg>
        <p class="mt-4 text-sm font-medium text-primary">
          {{ t('profile.cvParser.parseSuccess') }}
        </p>
      </div>

      <DialogFooter>
        <!-- During parsing the button cancels the in-flight request instead of just closing -->
        <Button
          variant="outline"
          @click="isParseSuccess ? undefined : (isParsing || isUploading ? cancelUpload() : closeDialog())"
          :disabled="isParseSuccess"
        >
          {{ t('profile.cancel') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
/* Circle traces itself from stroke-dashoffset 151 (hidden) down to 0 (fully drawn) */
@keyframes circle-draw {
  from { stroke-dashoffset: 151; }
  to   { stroke-dashoffset: 0; }
}

/* Checkmark traces itself from stroke-dashoffset 36 down to 0, starting after the circle */
@keyframes check-draw {
  from { stroke-dashoffset: 36; }
  to   { stroke-dashoffset: 0; }
}

.success-circle {
  /* 'both' fill-mode: apply from-state before start, keep to-state after end */
  animation: circle-draw 0.5s ease-out both;
}

.success-check {
  /* Delay matches the circle duration so the check starts right as the circle finishes */
  animation: check-draw 0.4s ease-out 0.45s both;
}
</style>
