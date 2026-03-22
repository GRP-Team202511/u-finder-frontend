<template>
  <section class="box-border rounded-[28px] border border-[#dddddd] bg-white p-5">
    <div class="mb-3">
      <div>
        <h2 class="m-0 text-[22px] font-extrabold leading-[1.15] text-[#111111]">{{ t('dashboard.recentUsers.title') }}</h2>
        <p class="mt-1.5 text-[13px] leading-[1.4] text-[#6b6b6b]">
          {{ t('dashboard.recentUsers.subtitle') }}
        </p>
      </div>
    </div>

    <div class="mb-[14px] flex flex-wrap items-center justify-between gap-3">
      <div class="min-w-[220px] flex-1">
        <Input
          v-model="searchQuery"
          type="text"
          class="h-[42px] w-full rounded-[14px] border border-[#d8d8d8] bg-white px-[14px] text-[13px] text-[#111111]"
          :placeholder="t('dashboard.recentUsers.searchPlaceholder')"
        />
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <label class="text-[13px] text-[#666666]">{{ t('dashboard.filters.sortBy') }}</label>
        <Select :model-value="sortKey" @update:model-value="handleSortKeyChange">
          <SelectTrigger class="h-[42px] min-w-[120px] text-[13px]">
            <SelectValue>{{ sortKeyLabel }}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">{{ t('dashboard.filters.sortOptions.name') }}</SelectItem>
            <SelectItem value="role">{{ t('dashboard.filters.sortOptions.plan') }}</SelectItem>
            <SelectItem value="status">{{ t('dashboard.filters.sortOptions.status') }}</SelectItem>
            <SelectItem value="id">{{ t('dashboard.filters.sortOptions.id') }}</SelectItem>
          </SelectContent>
        </Select>

        <Select :model-value="sortOrder" @update:model-value="handleSortOrderChange">
          <SelectTrigger class="h-[42px] min-w-[120px] text-[13px]">
            <SelectValue>{{ sortOrderLabel }}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">{{ t('dashboard.filters.orderOptions.asc') }}</SelectItem>
            <SelectItem value="desc">{{ t('dashboard.filters.orderOptions.desc') }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div class="overflow-hidden rounded-[18px] border border-[#e4e4e4] bg-white max-[1100px]:overflow-x-auto">
      <Table class="w-full table-fixed border-collapse max-[1100px]:min-w-[780px]">
        <TableHeader>
          <TableRow>
            <TableHead class="border-b border-[#e4e4e4] bg-[#f7f7f7] px-[14px] py-[11px] text-left text-[13px] font-bold text-[#666666]">{{ t('dashboard.recentUsers.table.user') }}</TableHead>
            <TableHead class="border-b border-[#e4e4e4] bg-[#f7f7f7] px-[14px] py-[11px] text-left text-[13px] font-bold text-[#666666]">{{ t('dashboard.recentUsers.table.plan') }}</TableHead>
            <TableHead class="border-b border-[#e4e4e4] bg-[#f7f7f7] px-[14px] py-[11px] text-left text-[13px] font-bold text-[#666666]">{{ t('dashboard.recentUsers.table.status') }}</TableHead>
            <TableHead class="border-b border-[#e4e4e4] bg-[#f7f7f7] px-[14px] py-[11px] text-left text-[13px] font-bold text-[#666666]">{{ t('dashboard.recentUsers.table.created') }}</TableHead>
            <TableHead class="border-b border-[#e4e4e4] bg-[#f7f7f7] px-[14px] py-[11px] text-left text-[13px] font-bold text-[#666666]">{{ t('dashboard.recentUsers.table.actions') }}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow v-if="paginatedUsers.length === 0">
            <TableCell :colspan="5" class="px-[14px] py-5 text-center text-[13px] text-[#777777]">{{ t('dashboard.recentUsers.empty') }}</TableCell>
          </TableRow>

          <TableRow v-for="user in paginatedUsers" :key="user.id">
            <TableCell class="align-middle border-b border-[#eeeeee] px-[14px] py-[11px]">
              <div class="flex flex-col gap-0.5">
                <div class="text-sm font-bold leading-[1.2] text-[#111111]">{{ user.name }}</div>
                <div class="text-xs leading-[1.25] text-[#777777]">{{ user.email }}</div>
                <div class="text-xs leading-[1.25] text-[#777777]">#{{ user.id }}</div>
              </div>
            </TableCell>

            <TableCell class="align-middle border-b border-[#eeeeee] px-[14px] py-[11px]">
              <span class="inline-flex min-w-[78px] items-center justify-center rounded-full border border-[#dddddd] bg-[#f8f8f8] px-2.5 py-[5px] text-xs text-[#222222]">{{ user.role }}</span>
            </TableCell>

            <TableCell class="align-middle border-b border-[#eeeeee] px-[14px] py-[11px]">
              <span class="inline-flex min-w-[78px] items-center justify-center rounded-full border border-[#dddddd] bg-[#f8f8f8] px-2.5 py-[5px] text-xs text-[#222222]">{{ user.status }}</span>
            </TableCell>

            <TableCell class="align-middle border-b border-[#eeeeee] px-[14px] py-[11px] text-[13px] leading-[1.3] text-[#555555]">
              {{ user.createdAt }}
            </TableCell>

            <TableCell class="align-middle border-b border-[#eeeeee] px-[14px] py-[11px]">
              <div class="flex flex-wrap gap-1.5">
                <Button
                  v-if="user.availableActions.includes('block')"
                  variant="secondary"
                  size="sm"
                  :disabled="actionLoading === user.id"
                  @click="handleBlock(user.id)"
                >{{ t('dashboard.recentUsers.actions.block') }}</Button>
                <Button
                  v-if="user.availableActions.includes('unblock')"
                  variant="secondary"
                  size="sm"
                  :disabled="actionLoading === user.id"
                  @click="handleUnblock(user.id)"
                >{{ t('dashboard.recentUsers.actions.unblock') }}</Button>
                <Button
                  v-if="user.availableActions.includes('delete')"
                  variant="destructive"
                  size="sm"
                  :disabled="actionLoading === user.id"
                  @click="handleDelete(user.id)"
                >{{ t('dashboard.recentUsers.actions.delete') }}</Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2 text-xs text-[#666666]">
        <span>{{ t('dashboard.pagination.rowsPerPage') }}</span>
        <Select :model-value="String(rowsPerPage)" @update:model-value="handleRowsPerPageChange">
          <SelectTrigger class="h-[34px] min-w-16 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="text-xs text-[#666666]">
        {{ t('dashboard.pagination.pageOf', { page: currentPage, total: totalPages }) }}
      </div>

      <div class="flex items-center gap-1.5">
        <Button variant="secondary" size="sm" @click="prevPage" :disabled="currentPage === 1">
          ‹
        </Button>
        <Button
          variant="secondary"
          size="sm"
          @click="nextPage"
          :disabled="currentPage === totalPages || totalPages === 0"
        >
          ›
        </Button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { AcceptableValue } from 'reka-ui'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'vue-sonner'
import {
  fetchAdminUsers,
  blockUser,
  unblockUser,
  deleteUser,
  type AdminUser,
} from '@/api/dashboard'
import { extractErrorMessage } from '@/api/http'
import { useAdminStore } from '@/stores/adminStore'

const adminStore = useAdminStore()
const { t } = useI18n()

const ROLE_PRIORITY: Record<string, number> = {
  '4': 0,
  '3': 1,
  '2': 2,
  '1': 3,
}

interface UserRow {
  id: number
  name: string
  email: string
  roleType: string
  role: string
  status: string
  createdAt: string
  availableActions: string[]
}

function mapUser(u: AdminUser): UserRow {
  const isSelf = u.id === adminStore.admin?.id
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    roleType: u.type,
    role: t(`dashboard.recentUsers.roles.${u.type}`, t('dashboard.recentUsers.roles.unknown')),
    status: t(`dashboard.recentUsers.statuses.${u.status.toLowerCase()}`, t('dashboard.recentUsers.statuses.unknown')),
    createdAt: new Date(u.created_at).toLocaleDateString(),
    availableActions: isSelf
      ? u.available_actions.filter(a => a !== 'block' && a !== 'delete')
      : u.available_actions,
  }
}

const users = ref<UserRow[]>([])
const loadingUsers = ref(false)
const actionLoading = ref<number | null>(null)

async function loadUsers() {
  loadingUsers.value = true
  try {
    const raw = await fetchAdminUsers()
    users.value = raw.map(mapUser)
  } catch (e: unknown) {
    toast.error(extractErrorMessage(e, t('dashboard.recentUsers.toasts.loadFailed')))
  } finally {
    loadingUsers.value = false
  }
}

async function handleBlock(userId: number) {
  actionLoading.value = userId
  try {
    await blockUser(userId)
    toast.success(t('dashboard.recentUsers.toasts.userBlocked'))
    await loadUsers()
  } catch (e: unknown) {
    toast.error(extractErrorMessage(e, t('dashboard.recentUsers.toasts.blockFailed')))
  } finally {
    actionLoading.value = null
  }
}

async function handleUnblock(userId: number) {
  actionLoading.value = userId
  try {
    await unblockUser(userId)
    toast.success(t('dashboard.recentUsers.toasts.userUnblocked'))
    await loadUsers()
  } catch (e: unknown) {
    toast.error(extractErrorMessage(e, t('dashboard.recentUsers.toasts.unblockFailed')))
  } finally {
    actionLoading.value = null
  }
}

async function handleDelete(userId: number) {
  if (!confirm(t('dashboard.recentUsers.confirmDelete'))) return
  actionLoading.value = userId
  try {
    await deleteUser(userId)
    toast.success(t('dashboard.recentUsers.toasts.userDeleted'))
    await loadUsers()
  } catch (e: unknown) {
    toast.error(extractErrorMessage(e, t('dashboard.recentUsers.toasts.deleteFailed')))
  } finally {
    actionLoading.value = null
  }
}

onMounted(() => {
  loadUsers()
})

const searchQuery = ref('')
const sortKey = ref<'name' | 'role' | 'status' | 'id'>('name')
const sortOrder = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)
const rowsPerPage = ref(5)

const sortKeyLabel = computed(() => {
  const labelMap: Record<typeof sortKey.value, string> = {
    name: t('dashboard.filters.sortOptions.name'),
    role: t('dashboard.filters.sortOptions.plan'),
    status: t('dashboard.filters.sortOptions.status'),
    id: t('dashboard.filters.sortOptions.id'),
  }
  return labelMap[sortKey.value]
})

const sortOrderLabel = computed(() => {
  return sortOrder.value === 'asc'
    ? t('dashboard.filters.orderOptions.asc')
    : t('dashboard.filters.orderOptions.desc')
})

const filteredUsers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return users.value
  return users.value.filter((u) =>
    u.name.toLowerCase().includes(query) ||
    u.email.toLowerCase().includes(query) ||
    u.role.toLowerCase().includes(query) ||
    u.status.toLowerCase().includes(query) ||
    String(u.id).includes(query)
  )
})

const sortedUsers = computed(() => {
  const copied = [...filteredUsers.value]
  copied.sort((a, b) => {
    const key = sortKey.value

    if (key === 'role') {
      const aRank = ROLE_PRIORITY[a.roleType] ?? 99
      const bRank = ROLE_PRIORITY[b.roleType] ?? 99

      if (aRank !== bRank) {
        return sortOrder.value === 'asc' ? aRank - bRank : bRank - aRank
      }

      const aName = a.name.toLowerCase()
      const bName = b.name.toLowerCase()
      if (aName < bName) return sortOrder.value === 'asc' ? -1 : 1
      if (aName > bName) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    }

    const aVal = a[key]
    const bVal = b[key]
    if (typeof aVal === 'number' && typeof bVal === 'number')
      return sortOrder.value === 'asc' ? aVal - bVal : bVal - aVal
    const aS = String(aVal).toLowerCase(), bS = String(bVal).toLowerCase()
    if (aS < bS) return sortOrder.value === 'asc' ? -1 : 1
    if (aS > bS) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
  return copied
})

const totalPages = computed(() =>
  sortedUsers.value.length === 0 ? 0 : Math.ceil(sortedUsers.value.length / rowsPerPage.value)
)

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value
  return sortedUsers.value.slice(start, start + rowsPerPage.value)
})

function nextPage() { if (currentPage.value < totalPages.value) currentPage.value++ }
function prevPage() { if (currentPage.value > 1) currentPage.value-- }

function handleSortKeyChange(value: AcceptableValue) {
  if (typeof value !== 'string') return
  sortKey.value = value as typeof sortKey.value
}

function handleSortOrderChange(value: AcceptableValue) {
  if (typeof value !== 'string') return
  if (value !== 'asc' && value !== 'desc') return
  sortOrder.value = value
}

function handleRowsPerPageChange(value: AcceptableValue) {
  if (typeof value !== 'string') return
  const n = Number(value)
  if ([5, 10, 20].includes(n)) rowsPerPage.value = n
}

watch([searchQuery, sortKey, sortOrder, rowsPerPage], () => { currentPage.value = 1 })
</script>