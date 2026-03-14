<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from '@/components/ui/item'
import {
  Monitor,
  Smartphone,
  Tablet,
  Bot,
  HelpCircle,
  BadgeCheck,
} from 'lucide-vue-next'
import { useAdminStore } from '@/stores/adminStore'
import { getDevices, logoutDevice, logoutAllDevices } from '@/api/adminApi'
import type { Device } from '@/api/adminApi'

const { t, locale } = useI18n()
const router = useRouter()
const adminStore = useAdminStore()

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

// Device list state
const devices = ref<Device[]>([])
const isFetching = ref(false)
const loadingSessionIds = ref<Set<number>>(new Set())
const isLoggingOutAll = ref(false)

// Fetch device list when dialog opens
watch(() => props.open, (newValue) => {
  if (newValue) {
    fetchDevices()
  }
})

async function fetchDevices() {
  isFetching.value = true
  try {
    const response = await getDevices()
    // Sort: current device first, then by created_at descending
    devices.value = [...response.data.devices].sort((a, b) => {
      if (a.is_current) return -1
      if (b.is_current) return 1
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  } catch (error) {
    console.error('Failed to fetch devices:', error)
    toast.error(t('settings.account.devices.fetchError'))
  } finally {
    isFetching.value = false
  }
}

// Return the appropriate icon component for each device type
function deviceIcon(type: Device['device_type']) {
  switch (type) {
    case 'PC':      return Monitor
    case 'Mobile':  return Smartphone
    case 'Tablet':  return Tablet
    case 'Bot':     return Bot
    default:        return HelpCircle
  }
}

// Format ISO 8601 date string to a human-readable local date/time
function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleString(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function handleLogoutDevice(sessionId: number) {
  loadingSessionIds.value = new Set(loadingSessionIds.value).add(sessionId)
  try {
    await logoutDevice(sessionId)
    toast.success(t('settings.account.devices.logoutSuccess'))
    // Remove the logged-out device from the list without re-fetching
    devices.value = devices.value.filter(d => d.session_id !== sessionId)
  } catch (error) {
    console.error('Failed to logout device:', error)
    toast.error(t('settings.account.devices.logoutError'))
  } finally {
    const next = new Set(loadingSessionIds.value)
    next.delete(sessionId)
    loadingSessionIds.value = next
  }
}

async function handleLogoutAll() {
  isLoggingOutAll.value = true
  try {
    await logoutAllDevices()
    toast.success(t('settings.account.devices.logoutAllSuccess'))
    // Clear local user state and redirect to login
    adminStore.logout()
    emit('update:open', false)
    router.push('/login')
  } catch (error) {
    console.error('Failed to logout all devices:', error)
    toast.error(t('settings.account.devices.logoutAllError'))
  } finally {
    isLoggingOutAll.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ t('settings.account.devices.title') }}</DialogTitle>
        <DialogDescription>{{ t('settings.account.devices.description') }}</DialogDescription>
      </DialogHeader>

      <!-- Loading skeletons -->
      <div v-if="isFetching" class="space-y-2 py-1">
        <Skeleton v-for="i in 3" :key="i" class="h-16 w-full rounded-md" />
      </div>

      <!-- Device list -->
      <div v-else class="space-y-2 max-h-[60vh] overflow-y-auto py-1 pr-1">
        <Item
          v-for="device in devices"
          :key="device.session_id"
          :variant="device.is_current ? 'muted' : 'default'"
          size="sm"
        >
          <!-- Device type icon -->
          <ItemMedia variant="icon">
            <component :is="deviceIcon(device.device_type)" />
          </ItemMedia>

          <!-- Device information -->
          <ItemContent>
            <ItemTitle>
              {{ device.browser }} · {{ device.os }}
              <!-- Current device badge -->
              <span
                v-if="device.is_current"
                class="inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary"
              >
                <BadgeCheck class="size-3" />
                {{ t('settings.account.devices.currentDevice') }}
              </span>
            </ItemTitle>
            <ItemDescription>
              {{ t(`settings.account.devices.deviceTypes.${device.device_type}`) }}
              · {{ t('settings.account.devices.loginTime') }} {{ formatDate(device.created_at) }}
            </ItemDescription>
          </ItemContent>

          <!-- Log out button for non-current devices -->
          <ItemActions v-if="!device.is_current">
            <Button
              variant="outline"
              size="sm"
              :disabled="loadingSessionIds.has(device.session_id)"
              @click="handleLogoutDevice(device.session_id)"
            >
              {{ t('settings.account.devices.logoutButton') }}
            </Button>
          </ItemActions>
        </Item>
      </div>

      <Separator />

      <DialogFooter>
        <Button
          variant="destructive"
          :disabled="isFetching || isLoggingOutAll"
          @click="handleLogoutAll"
        >
          {{ t('settings.account.devices.logoutAllButton') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
