<script setup lang="ts">
import { ref, watch } from 'vue'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { AlertTriangle } from 'lucide-vue-next'
import { disable2FA } from '@/api/userApi'

const { t } = useI18n()

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'success': []
}>()

const password = ref('')
const isDisabling = ref(false)

// Reset form when dialog opens
watch(() => props.open, (newValue) => {
  if (newValue) {
    password.value = ''
    isDisabling.value = false
  }
})

async function handleDisable() {
  if (!password.value) {
    toast.error(t('settings.account.twoFactor.disable.passwordRequired'))
    return
  }

  isDisabling.value = true
  try {
    await disable2FA({ password: password.value })
    
    toast.success(t('settings.account.twoFactor.disable.success'))
    emit('success')
    emit('update:open', false)
  } catch (error: any) {
    console.error('Failed to disable 2FA:', error)
    const message = error.response?.data?.message
    if (error.response?.status === 401) {
      if (message && message.includes('password')) {
        toast.error(t('settings.account.twoFactor.disable.wrongPassword'))
      } else {
        toast.error(t('settings.account.twoFactor.disable.error'))
      }
    } else if (error.response?.status === 400) {
      toast.error(t('settings.account.twoFactor.disable.notEnabled'))
    } else {
      toast.error(t('settings.account.twoFactor.disable.error'))
    }
  } finally {
    isDisabling.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>{{ t('settings.account.twoFactor.disable.title') }}</DialogTitle>
      </DialogHeader>

      <div class="space-y-4">
        <!-- Warning -->
        <div class="flex gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertTriangle class="size-5 text-red-600 dark:text-red-500 shrink-0 mt-0.5" />
          <div class="space-y-1">
            <p class="text-sm font-medium text-red-900 dark:text-red-100">
              {{ t('settings.account.twoFactor.disable.warning') }}
            </p>
            <p class="text-sm text-red-800 dark:text-red-200">
              {{ t('settings.account.twoFactor.disable.warningDesc') }}
            </p>
          </div>
        </div>

        <!-- Password Input -->
        <div class="space-y-2">
          <Label for="password">
            {{ t('settings.account.twoFactor.disable.enterPassword') }}
          </Label>
          <Input
            id="password"
            v-model="password"
            type="password"
            :placeholder="t('settings.account.twoFactor.disable.passwordPlaceholder')"
            @keydown.enter="handleDisable"
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          @click="emit('update:open', false)"
          variant="outline"
          :disabled="isDisabling"
        >
          {{ t('settings.account.twoFactor.disable.cancel') }}
        </Button>
        <Button
          @click="handleDisable"
          variant="destructive"
          :disabled="isDisabling || !password"
        >
          <Spinner v-if="isDisabling" class="animate-spin mr-2" />
          {{ t('settings.account.twoFactor.disable.confirm') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
