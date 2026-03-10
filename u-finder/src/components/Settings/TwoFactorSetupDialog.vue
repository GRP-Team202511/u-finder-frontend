<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Spinner } from '@/components/ui/spinner'
import { Copy, CheckCircle2, AlertTriangle } from 'lucide-vue-next'
// import { setup2FA, confirm2FA } from '@/api/userApi'

const { t } = useI18n()

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'success': []
}>()

// Setup steps: 1 = QR Code + Verify, 2 = Backup Codes
const currentStep = ref(1)
const isLoading = ref(false)

// Step 1 data
const qrCodeBase64 = ref('')
const totpUri = ref('')
const verificationCode = ref('')
const isVerifying = ref(false)

// Step 2 data
const backupCodes = ref<string[]>([])
const copiedAll = ref(false)

// Watch dialog open state to reset
watch(() => props.open, (newValue) => {
  if (newValue) {
    resetDialog()
    initiate2FASetup()
  }
})

function resetDialog() {
  currentStep.value = 1
  isLoading.value = false
  qrCodeBase64.value = ''
  totpUri.value = ''
  backupCodes.value = []
  copiedAll.value = false
  verificationCode.value = ''
  isVerifying.value = false
}

async function initiate2FASetup() {
  isLoading.value = true
  try {
    // TODO: Uncomment when API is ready
    // const response = await setup2FA()
    // qrCodeBase64.value = response.qr_code_base64
    // totpUri.value = response.totp_uri
    
    // Mock data for development
    qrCodeBase64.value = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    totpUri.value = 'otpauth://totp/U-Finder:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=U-Finder'
  } catch (error) {
    console.error('Failed to setup 2FA:', error)
    toast.error(t('settings.account.twoFactor.setup.error'))
    emit('update:open', false)
  } finally {
    isLoading.value = false
  }
}

async function nextStep() {
  // If on step 1, verify the code first
  if (currentStep.value === 1) {
    if (verificationCode.value.length !== 6) {
      toast.error(t('settings.account.twoFactor.setup.invalidCode'))
      return
    }
    
    isVerifying.value = true
    try {
      // TODO: Uncomment when API is ready
      // const response = await confirm2FA({ code: verificationCode.value })
      // backupCodes.value = response.backup_codes
      
      // Mock success for development
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock backup codes returned from API
      backupCodes.value = [
        'A1B2C3D4',
        'E5F6G7H8',
        'I9J0K1L2',
        'M3N4O5P6',
        'Q7R8S9T0',
        'U1V2W3X4',
        'Y5Z6A7B8',
        'C9D0E1F2'
      ]
      
      // Move to next step (show backup codes)
      currentStep.value = 2
    } catch (error: any) {
      console.error('Failed to verify 2FA:', error)
      if (error.response?.status === 400) {
        toast.error(t('settings.account.twoFactor.setup.wrongCode'))
      } else {
        toast.error(t('settings.account.twoFactor.setup.verifyError'))
      }
      verificationCode.value = ''
    } finally {
      isVerifying.value = false
    }
  }
}

function previousStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

function copyAllCodes() {
  const codesText = backupCodes.value.join('\n')
  navigator.clipboard.writeText(codesText)
  copiedAll.value = true
  toast.success(t('settings.account.twoFactor.setup.copiedCodes'))
  
  setTimeout(() => {
    copiedAll.value = false
  }, 3000)
}

function handleFinish() {
  toast.success(t('settings.account.twoFactor.setup.success'))
  emit('success')
  emit('update:open', false)
}

function closeDialog() {
  emit('update:open', false)
}

const dialogTitle = computed(() => {
  switch (currentStep.value) {
    case 1:
      return t('settings.account.twoFactor.setup.step1Title')
    case 2:
      return t('settings.account.twoFactor.setup.step2Title')
    default:
      return ''
  }
})

const dialogDescription = computed(() => {
  switch (currentStep.value) {
    case 1:
      return t('settings.account.twoFactor.setup.step1Desc')
    case 2:
      return t('settings.account.twoFactor.setup.step2Desc')
    default:
      return ''
  }
})
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
        <DialogDescription>
          {{ dialogDescription }}
        </DialogDescription>
      </DialogHeader>

      <!-- Step 1: QR Code + Verify -->
      <div v-if="currentStep === 1" class="space-y-4">
        <div v-if="isLoading" class="flex justify-center py-8">
          <Spinner class="animate-spin size-8" />
        </div>
        <div v-else class="space-y-4">
          <!-- QR Code Display -->
          <div class="flex justify-center p-6 bg-white rounded-lg">
            <img :src="qrCodeBase64" alt="2FA QR Code" class="max-w-full h-auto" />
          </div>
          
          <!-- Manual Entry Option -->
          <div class="space-y-2">
            <Label class="text-sm text-muted-foreground">
              {{ t('settings.account.twoFactor.setup.manualEntry') }}
            </Label>
            <Input :value="totpUri" readonly class="font-mono text-xs" />
          </div>

          <Separator />

          <!-- Verification Code Input -->
          <div class="space-y-2">
            <Label for="verification-code">
              {{ t('settings.account.twoFactor.setup.enterCode') }}
            </Label>
            <div class="flex justify-center">
              <InputOTP
                id="verification-code"
                v-model="verificationCode"
                :maxlength="6"
              >
                <InputOTPGroup>
                  <InputOTPSlot :index="0" />
                  <InputOTPSlot :index="1" />
                  <InputOTPSlot :index="2" />
                  <InputOTPSlot :index="3" />
                  <InputOTPSlot :index="4" />
                  <InputOTPSlot :index="5" />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <p class="text-sm text-muted-foreground text-center">
              {{ t('settings.account.twoFactor.setup.codeFromApp') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Step 2: Backup Codes -->
      <div v-if="currentStep === 2" class="space-y-4">
        <!-- Warning -->
        <div class="flex gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <AlertTriangle class="size-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
          <div class="space-y-1">
            <p class="text-sm font-medium text-amber-900 dark:text-amber-100">
              {{ t('settings.account.twoFactor.setup.backupCodesWarning') }}
            </p>
            <p class="text-sm text-amber-800 dark:text-amber-200">
              {{ t('settings.account.twoFactor.setup.backupCodesWarning2') }}
            </p>
          </div>
        </div>

        <!-- Backup Codes Grid -->
        <div class="grid grid-cols-2 gap-3 p-4 bg-muted/50 rounded-lg border">
          <div
            v-for="(code, index) in backupCodes"
            :key="index"
            class="p-3 bg-background rounded border font-mono text-center text-sm font-medium"
          >
            {{ code }}
          </div>
        </div>

        <!-- Copy Button -->
        <Button @click="copyAllCodes" variant="outline" class="w-full gap-2">
          <CheckCircle2 v-if="copiedAll" class="size-4" />
          <Copy v-else class="size-4" />
          {{ copiedAll ? t('settings.account.twoFactor.setup.copied') : t('settings.account.twoFactor.setup.copyAll') }}
        </Button>
      </div>

      <DialogFooter class="flex-row gap-2 sm:gap-2">
        <!-- Step indicator -->
        <div class="flex-1 flex items-center gap-1">
          <div
            v-for="step in 2"
            :key="step"
            class="h-1.5 flex-1 rounded-full transition-colors"
            :class="step <= currentStep ? 'bg-primary' : 'bg-muted'"
          />
        </div>

        <!-- Navigation Buttons -->
        <div class="flex gap-2">
          <Button
            v-if="currentStep === 1"
            @click="closeDialog"
            variant="outline"
            :disabled="isVerifying"
          >
            {{ t('settings.account.twoFactor.setup.cancel') }}
          </Button>
          <Button
            v-if="currentStep === 1"
            @click="nextStep"
            :disabled="isLoading || isVerifying || verificationCode.length !== 6"
          >
            <Spinner v-if="isVerifying" class="animate-spin mr-2" />
            {{ t('settings.account.twoFactor.setup.next') }}
          </Button>
          <Button
            v-if="currentStep === 2"
            @click="handleFinish"
          >
            {{ t('settings.account.twoFactor.setup.done') }}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
