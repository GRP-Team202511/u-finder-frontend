<!-- This code was completed by GRP Team 2025.11. -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Spinner } from '@/components/ui/spinner'
import { Copy, CheckCircle2, AlertTriangle } from 'lucide-vue-next'
import { regenerateBackupCodes } from '@/api/userApi'

const { t } = useI18n()

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'success': []
}>()

const currentStep = ref<'verify' | 'show'>('verify')
const verificationCode = ref('')
const isVerifying = ref(false)
const newBackupCodes = ref<string[]>([])
const copiedAll = ref(false)
const verificationCodeValid = computed(() => /^\d{6}$/.test(verificationCode.value))

watch(verificationCode, (newValue) => {
  const digitsOnly = newValue.replace(/\D/g, '').slice(0, 6)
  if (digitsOnly !== newValue) {
    verificationCode.value = digitsOnly
  }
})

// Reset when dialog opens
watch(() => props.open, (newValue) => {
  if (newValue) {
    currentStep.value = 'verify'
    verificationCode.value = ''
    isVerifying.value = false
    newBackupCodes.value = []
    copiedAll.value = false
  }
})

async function handleVerify() {
  if (!verificationCodeValid.value) {
    toast.error(t('settings.account.twoFactor.regenerate.invalidCode'))
    return
  }

  isVerifying.value = true
  try {
    const response = await regenerateBackupCodes({ code: verificationCode.value })
    newBackupCodes.value = response.data.backup_codes
    
    currentStep.value = 'show'
  } catch (error: any) {
    console.error('Failed to regenerate backup codes:', error)
    const message = error.response?.data?.message
    if (error.response?.status === 400) {
      if (message && message.includes('not enabled')) {
        toast.error(t('settings.account.twoFactor.regenerate.notEnabled'))
      } else {
        toast.error(t('settings.account.twoFactor.regenerate.wrongCode'))
      }
    } else {
      toast.error(t('settings.account.twoFactor.regenerate.error'))
    }
    verificationCode.value = ''
  } finally {
    isVerifying.value = false
  }
}

function copyAllCodes() {
  const codesText = newBackupCodes.value.join('\n')
  navigator.clipboard.writeText(codesText)
  copiedAll.value = true
  toast.success(t('settings.account.twoFactor.regenerate.copiedCodes'))
  
  setTimeout(() => {
    copiedAll.value = false
  }, 3000)
}

function handleClose() {
  if (currentStep.value === 'show') {
    emit('success')
  }
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          {{ currentStep === 'verify' 
            ? t('settings.account.twoFactor.regenerate.verifyTitle') 
            : t('settings.account.twoFactor.regenerate.newCodesTitle') 
          }}
        </DialogTitle>
      </DialogHeader>

      <!-- Step 1: Verify TOTP Code -->
      <div v-if="currentStep === 'verify'" class="space-y-4">
        <div class="space-y-2">
          <Label for="verification-code">
            {{ t('settings.account.twoFactor.regenerate.enterCode') }}
          </Label>
          <div class="flex justify-center">
            <InputOTP
              id="verification-code"
              v-model="verificationCode"
              :maxlength="6"
              @complete="handleVerify"
            >
              <InputOTPGroup class="gap-2.5">
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
            {{ t('settings.account.twoFactor.regenerate.codeFromApp') }}
          </p>
        </div>
      </div>

      <!-- Step 2: Show New Backup Codes -->
      <div v-if="currentStep === 'show'" class="space-y-4">
        <!-- Warning -->
        <div class="flex gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <AlertTriangle class="size-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
          <div class="space-y-1">
            <p class="text-sm font-medium text-amber-900 dark:text-amber-100">
              {{ t('settings.account.twoFactor.regenerate.warning') }}
            </p>
            <p class="text-sm text-amber-800 dark:text-amber-200">
              {{ t('settings.account.twoFactor.regenerate.warningDesc') }}
            </p>
          </div>
        </div>

        <!-- New Backup Codes Grid -->
        <div class="grid grid-cols-1 gap-3 p-4 bg-muted/50 rounded-lg border sm:grid-cols-2">
          <div
            v-for="(code, index) in newBackupCodes"
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
          {{ copiedAll ? t('settings.account.twoFactor.regenerate.copied') : t('settings.account.twoFactor.regenerate.copyAll') }}
        </Button>
      </div>

      <DialogFooter>
        <Button
          v-if="currentStep === 'verify'"
          @click="emit('update:open', false)"
          variant="outline"
          :disabled="isVerifying"
        >
          {{ t('settings.account.twoFactor.regenerate.cancel') }}
        </Button>
        <Button
          v-if="currentStep === 'verify'"
          @click="handleVerify"
          :disabled="isVerifying || !verificationCodeValid"
        >
          <Spinner v-if="isVerifying" class="animate-spin mr-2" />
          {{ t('settings.account.twoFactor.regenerate.verify') }}
        </Button>
        <Button
          v-if="currentStep === 'show'"
          @click="handleClose"
        >
          {{ t('settings.account.twoFactor.regenerate.done') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
