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
  /** Emitted after a successful upload; carries the new avatar URL */
  'success': [avatarUrl: string]
}>()

// ─── Constants ────────────────────────────────────────────────────────────────

const { t } = useI18n()

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 // 2 MB

// ─── State ────────────────────────────────────────────────────────────────────

// The hidden <input type="file"> element used to trigger the OS file picker
const fileInputRef = ref<HTMLInputElement | null>(null)

// The <img> element that Cropper.js attaches to
const imageRef = ref<HTMLImageElement | null>(null)

// Object URL created from the selected file; revoked when dialog closes
const imageObjectUrl = ref<string | null>(null)

// Cropper.js instance; destroyed when dialog closes or a new image is selected
let cropperInstance: Cropper | null = null

const isUploading = ref(false)

// ─── Dialog lifecycle ─────────────────────────────────────────────────────────

watch(
  () => props.open,
  (opened) => {
    if (!opened) {
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
  isUploading.value = false
}

onBeforeUnmount(cleanUp)

// ─── File selection ───────────────────────────────────────────────────────────

function openFilePicker() {
  fileInputRef.value?.click()
}

function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  // Reset the input value so the same file can be re-selected after a reselect
  input.value = ''

  if (!file) return

  if (!ACCEPTED_TYPES.includes(file.type)) {
    toast.error(t('settings.account.avatarDialog.invalidFileType'))
    return
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    toast.error(t('settings.account.avatarDialog.fileTooLarge'))
    return
  }

  loadImageIntoCropper(file)
}

// ─── Cropper ──────────────────────────────────────────────────────────────────

async function loadImageIntoCropper(file: File) {
  // Destroy any previous Cropper instance before creating a new one
  destroyCropper()

  if (imageObjectUrl.value) {
    URL.revokeObjectURL(imageObjectUrl.value)
  }

  imageObjectUrl.value = URL.createObjectURL(file)

  // Wait for Vue to render the <img> element with the new src
  await nextTick()

  if (!imageRef.value) return

  cropperInstance = new Cropper(imageRef.value, {
    // Force a 1:1 square crop box
    aspectRatio: 1,
    // Show only the crop box, not the full image canvas controls
    viewMode: 1,
    // Restrict the crop box to stay within the image boundary
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
    // Export the cropped area as a canvas and convert to a Blob (JPEG, quality 0.9)
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
    emit('success', response.data.avatar_url)
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
    <DialogContent class="sm:max-w-[520px]">
      <DialogHeader>
        <DialogTitle>{{ t('settings.account.avatarDialog.title') }}</DialogTitle>
        <DialogDescription>
          {{ t('settings.account.avatarDialog.description') }}
        </DialogDescription>
      </DialogHeader>

      <!-- Hidden file input -->
      <input
        ref="fileInputRef"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="hidden"
        @change="onFileSelected"
      />

      <!-- Cropper area: shown only after an image is selected -->
      <div class="py-2">
        <div
          v-if="imageObjectUrl"
          class="relative w-full overflow-hidden rounded-md border bg-muted"
          style="max-height: 380px;"
        >
          <!-- Cropper.js targets this element -->
          <img
            ref="imageRef"
            :src="imageObjectUrl"
            alt="crop-target"
            class="block max-w-full"
            style="max-height: 380px;"
          />
        </div>

        <!-- Empty state: prompt user to select an image -->
        <div
          v-else
          class="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-muted-foreground/40 bg-muted/30 py-14"
        >
          <p class="text-sm text-muted-foreground">
            {{ t('settings.account.avatarDialog.selectImage') }}
          </p>
          <Button variant="outline" size="sm" @click="openFilePicker">
            {{ t('settings.account.avatarDialog.selectImage') }}
          </Button>
        </div>
      </div>

      <DialogFooter class="gap-2 sm:gap-0">
        <!-- Reselect button appears once an image is loaded -->
        <Button
          v-if="imageObjectUrl"
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

        <Button
          type="button"
          :disabled="!imageObjectUrl || isUploading"
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
