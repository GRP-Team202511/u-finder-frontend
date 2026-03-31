<!-- This code was completed by GRP Team 2025.11. -->
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { AlertTriangle } from 'lucide-vue-next'
import { deleteAccount, verifyDeleteWith2FA, verifyDeleteWithEmail } from '@/api/adminApi'
import { useAdminStore } from '@/stores/adminStore'

const { t } = useI18n()
const router = useRouter()
const adminStore = useAdminStore()

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

type Step = 'confirm' | 'verify'

const step = ref<Step>('confirm')
const verificationMethod = ref<'email' | '2fa' | null>(null)
const tempToken = ref('')
const code = ref('')
const isLoading = ref(false)

watch(() => props.open, (newValue) => {
  if (newValue) {
    step.value = 'confirm'
    verificationMethod.value = null
    tempToken.value = ''
    code.value = ''
    isLoading.value = false
  }
})

const dialogTitle = computed(() => {
  if (step.value === 'confirm') {
    return t('settings.account.deleteAccount.title')
  }
  if (verificationMethod.value === '2fa') {
    return t('settings.account.deleteAccount.verify2faTitle')
  }
  return t('settings.account.deleteAccount.verifyEmailTitle')
})

async function handleInitiateDelete() {
  isLoading.value = true
  try {
    const response = await deleteAccount()
    tempToken.value = response.data.temp_token
    verificationMethod.value = response.data.verification
    step.value = 'verify'
  } catch (error: any) {
    console.error('Failed to initiate account deletion:', error)
    if (error.response?.status === 401) {
      toast.error(t('settings.account.deleteAccount.errors.unauthorized'))
    } else {
      toast.error(t('settings.account.deleteAccount.errors.initiateFailed'))
    }
  } finally {
    isLoading.value = false
  }
}

async function handleVerify() {
  if (!code.value.trim()) {
    toast.error(t('settings.account.deleteAccount.errors.codeRequired'))
    return
  }

  isLoading.value = true
  try {
    if (verificationMethod.value === '2fa') {
      await verifyDeleteWith2FA({ code: code.value.trim() }, tempToken.value)
    } else {
      await verifyDeleteWithEmail({ code: code.value.trim() }, tempToken.value)
    }

    toast.success(t('settings.account.deleteAccount.success'))
    emit('update:open', false)
    adminStore.logout()
    router.push({ name: 'Login' })
  } catch (error: any) {
    console.error('Failed to verify account deletion:', error)
    const message = error.response?.data?.message ?? ''
    if (error.response?.status === 401) {
      toast.error(t('settings.account.deleteAccount.errors.invalidToken'))
    } else if (error.response?.status === 400) {
      if (message.includes('already used')) {
        toast.error(t('settings.account.deleteAccount.errors.totpAlreadyUsed'))
      } else {
        toast.error(t('settings.account.deleteAccount.errors.invalidCode'))
      }
    } else {
      toast.error(t('settings.account.deleteAccount.errors.verifyFailed'))
    }
  } finally {
    isLoading.value = false
  }
}

function handleClose() {
  if (!isLoading.value) {
    emit('update:open', false)
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
        <DialogDescription v-if="step === 'confirm'">
          {{ t('settings.account.deleteAccount.description') }}
        </DialogDescription>
      </DialogHeader>

      <!-- Step 1: Confirmation warning -->
      <div v-if="step === 'confirm'" class="space-y-4">
        <div class="flex gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertTriangle class="size-5 text-red-600 dark:text-red-500 shrink-0 mt-0.5" />
          <div class="space-y-1">
            <p class="text-sm font-medium text-red-900 dark:text-red-100">
              {{ t('settings.account.deleteAccount.warningTitle') }}
            </p>
            <p class="text-sm text-red-800 dark:text-red-200">
              {{ t('settings.account.deleteAccount.warningDesc') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Step 2a: 2FA verification -->
      <div v-else-if="verificationMethod === '2fa'" class="space-y-4">
        <p class="text-sm text-muted-foreground">
          {{ t('settings.account.deleteAccount.verify2faDesc') }}
        </p>
        <div class="space-y-2">
          <Label for="delete-2fa-code">
            {{ t('settings.account.deleteAccount.codeLabel') }}
          </Label>
          <Input
            id="delete-2fa-code"
            v-model="code"
            :placeholder="t('settings.account.deleteAccount.code2faPlaceholder')"
            autocomplete="one-time-code"
            @keydown.enter="handleVerify"
          />
        </div>
      </div>

      <!-- Step 2b: Email verification -->
      <div v-else-if="verificationMethod === 'email'" class="space-y-4">
        <p class="text-sm text-muted-foreground">
          {{ t('settings.account.deleteAccount.verifyEmailDesc') }}
        </p>
        <div class="space-y-2">
          <Label for="delete-email-code">
            {{ t('settings.account.deleteAccount.codeLabel') }}
          </Label>
          <Input
            id="delete-email-code"
            v-model="code"
            :placeholder="t('settings.account.deleteAccount.codeEmailPlaceholder')"
            autocomplete="one-time-code"
            @keydown.enter="handleVerify"
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          :disabled="isLoading"
          @click="handleClose"
        >
          {{ t('settings.account.deleteAccount.cancel') }}
        </Button>

        <Button
          v-if="step === 'confirm'"
          variant="destructive"
          :disabled="isLoading"
          @click="handleInitiateDelete"
        >
          <Spinner v-if="isLoading" class="animate-spin mr-2" />
          {{ t('settings.account.deleteAccount.confirmButton') }}
        </Button>

        <Button
          v-else
          variant="destructive"
          :disabled="isLoading || !code.trim()"
          @click="handleVerify"
        >
          <Spinner v-if="isLoading" class="animate-spin mr-2" />
          {{ t('settings.account.deleteAccount.verifyButton') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
