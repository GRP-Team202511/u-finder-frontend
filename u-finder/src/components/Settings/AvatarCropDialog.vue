<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import Cropper from 'cropperjs'
// cropperjs v1 requires its own stylesheet for the crop-box UI
import 'cropperjs/dist/cropper.css'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { uploadAvatar } from '@/api/profileApi'

// ─── Props & Emits ────────────────────────────────────────────────────────────

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  /** Emitted after a successful upload; carries the avatar URLs map */
  'success': [avatarUrls: { original: string; webp_original: string; webp_256: string; webp_64: string }]
}>()

// ─── Constants ────────────────────────────────────────────────────────────────

const { t } = useI18n()

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 // 2 MB

// ─── State ────────────────────────────────────────────────────────────────────

// Two-phase flow: 'select' shows the drop zone, 'crop' shows the cropper
type Phase = 'select' | 'crop'
const phase = ref<Phase>('select')

const fileInputRef = ref<HTMLInputElement | null>(null)
const imageRef = ref<HTMLImageElement | null>(null)

// Metadata of the file chosen by the user, shown in the drop zone after selection
const selectedFile = ref<File | null>(null)

// Object URL created from the selected file; revoked when dialog closes
const imageObjectUrl = ref<string | null>(null)

// Cropper.js instance; destroyed when dialog closes or a new image is selected
let cropperInstance: Cropper | null = null

const isDragging = ref(false)
const isUploading = ref(false)

// ─── Dialog lifecycle ─────────────────────────────────────────────────────────

watch(
  () => props.open,
  (opened) => {
    if (opened) {
      phase.value = 'select'
    } else {
      cleanUp()
    }
  },
)

/** Release all resources when the dialog is dismissed */
function cleanUp() {
  destroyCropper()
  if (imageObjectUrl.value) {
    URL.revokeObjectURL(imageObjectUrl.value)
    imageObjectUrl.value = null
  }
  selectedFile.value = null
  phase.value = 'select'
  isDragging.value = false
  isUploading.value = false
}

onBeforeUnmount(cleanUp)

// ─── File validation ──────────────────────────────────────────────────────────

function validateFile(file: File): boolean {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    toast.error(t('settings.account.avatarDialog.invalidFileType'))
    return false
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    toast.error(t('settings.account.avatarDialog.fileTooLarge'))
    return false
  }
  return true
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

// ─── Drop zone interactions ───────────────────────────────────────────────────

function openFilePicker() {
  fileInputRef.value?.click()
}

function onFileInputChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  // Reset so the same file can be re-selected after switching back to select phase
  input.value = ''
  if (file) loadFile(file)
}

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
  if (file) loadFile(file)
}

// ─── Phase transition: select → crop ─────────────────────────────────────────

async function loadFile(file: File) {
  if (!validateFile(file)) return

  selectedFile.value = file

  // Destroy any existing cropper before creating a new one
  destroyCropper()
  if (imageObjectUrl.value) URL.revokeObjectURL(imageObjectUrl.value)
  imageObjectUrl.value = URL.createObjectURL(file)

  // Switch to the crop phase first so Vue renders the <img> element
  phase.value = 'crop'
  await nextTick()

  if (!imageRef.value) return

  cropperInstance = new Cropper(imageRef.value, {
    // Force a 1:1 square crop box
    aspectRatio: 1,
    // Restrict the crop box to stay within the image boundary
    viewMode: 1,
    // Start with the crop box covering 80% of the image
    autoCropArea: 0.8,
    responsive: true,
    background: false,
  })
}

function destroyCropper() {
  if (cropperInstance) {
    cropperInstance.destroy()
    cropperInstance = null
  }
}

// ─── Upload ───────────────────────────────────────────────────────────────────

async function handleUpload() {
  if (!cropperInstance) return

  isUploading.value = true
  try {
    // Export the cropped area as a 512×512 canvas, then convert to JPEG blob
    const canvas = cropperInstance.getCroppedCanvas({
      width: 512,
      height: 512,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    })

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b: Blob | null) => (b ? resolve(b) : reject(new Error('Canvas toBlob returned null'))),
        'image/jpeg',
        0.9,
      )
    })

    const croppedFile = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
    const response = await uploadAvatar(croppedFile)

    toast.success(t('settings.account.avatarDialog.uploadSuccess'))
    emit('success', response.data.avatar_urls)
    emit('update:open', false)
  } catch (error: any) {
    const status = error?.response?.status
    if (status === 413) {
      toast.error(t('settings.account.avatarDialog.fileTooLarge'))
    } else if (status === 415) {
      toast.error(t('settings.account.avatarDialog.invalidFileType'))
    } else {
      toast.error(t('settings.account.avatarDialog.uploadError'))
    }
  } finally {
    isUploading.value = false
  }
}

function handleCancel() {
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="props.open" @update:open="(val) => emit('update:open', val)">
    <DialogContent class="sm:max-w-[540px]">
      <DialogHeader>
        <DialogTitle>{{ t('settings.account.avatarDialog.title') }}</DialogTitle>
        <DialogDescription>
          {{
            phase === 'select'
              ? t('settings.account.avatarDialog.descriptionSelect')
              : t('settings.account.avatarDialog.descriptionCrop')
          }}
        </DialogDescription>
      </DialogHeader>

      <!-- Hidden file input — shared between both phases -->
      <input
        ref="fileInputRef"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        class="hidden"
        @change="onFileInputChange"
      />

      <!-- ── Phase 1: Drop zone ── -->
      <div v-if="phase === 'select'" class="py-4">
        <div
          class="border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer"
          :class="{
            'border-primary bg-primary/5': isDragging,
            'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50': !isDragging,
          }"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          @drop="handleDrop"
          @click="openFilePicker"
        >
          <!-- Upload icon -->
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
            {{ t('settings.account.avatarDialog.dropPrompt') }}
          </p>
          <p class="mt-2 text-xs text-muted-foreground">
            {{ t('settings.account.avatarDialog.supportedFormats') }}
          </p>
          <p class="text-xs text-muted-foreground">
            {{ t('settings.account.avatarDialog.maxSize') }}
          </p>
        </div>
      </div>

      <!-- ── Phase 2: Cropper ── -->
      <div v-else class="py-2 space-y-3">
        <!-- File info badge -->
        <div
          v-if="selectedFile"
          class="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground"
        >
          <!-- Image file icon -->
          <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span class="truncate font-medium text-foreground">{{ selectedFile.name }}</span>
          <span class="ml-auto shrink-0">{{ formatFileSize(selectedFile.size) }}</span>
        </div>

        <!-- Cropper canvas: fixed 360×360 prevents layout bugs on window resize -->
        <div
          class="relative mx-auto overflow-hidden rounded-md border bg-muted"
          style="width: 360px; height: 360px;"
        >
          <img
            ref="imageRef"
            :src="imageObjectUrl ?? undefined"
            alt="crop-target"
            class="block max-w-full max-h-full"
            style="max-height: 360px;"
          />
        </div>
      </div>

      <DialogFooter class="gap-3">
        <!-- Reselect: only visible in crop phase -->
        <Button
          v-if="phase === 'crop'"
          type="button"
          variant="outline"
          :disabled="isUploading"
          @click="openFilePicker"
        >
          {{ t('settings.account.avatarDialog.reselect') }}
        </Button>

        <Button
          type="button"
          variant="outline"
          :disabled="isUploading"
          @click="handleCancel"
        >
          {{ t('settings.account.avatarDialog.cancel') }}
        </Button>

        <!-- Upload: only enabled in crop phase -->
        <Button
          type="button"
          :disabled="phase === 'select' || isUploading"
          @click="handleUpload"
        >
          <Spinner v-if="isUploading" class="mr-2" />
          {{ isUploading
            ? t('settings.account.avatarDialog.uploading')
            : t('settings.account.avatarDialog.uploadAndSave') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
