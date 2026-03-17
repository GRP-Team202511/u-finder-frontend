<template>
  <section class="box-border rounded-[28px] border border-[#dddddd] bg-white p-5">
    <div class="mb-3">
      <div>
        <h2 class="m-0 text-[22px] font-extrabold leading-[1.15] text-[#111111]">Recent Users</h2>
        <p class="mt-1.5 text-[13px] leading-[1.4] text-[#6b6b6b]">
          Quick view for checking user pages, status, and last active time.
        </p>
      </div>
    </div>

    <div class="mb-[14px] flex flex-wrap items-center justify-between gap-3">
      <div class="min-w-[220px] flex-1">
        <Input
          v-model="searchQuery"
          type="text"
          class="h-[42px] w-full rounded-[14px] border border-[#d8d8d8] bg-white px-[14px] text-[13px] text-[#111111]"
          placeholder="Search users..."
        />
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <label class="text-[13px] text-[#666666]">Sort by</label>
        <Select :model-value="sortKey" @update:model-value="handleSortKeyChange">
          <SelectTrigger class="h-[42px] min-w-[120px] text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="role">Plan</SelectItem>
            <SelectItem value="status">Status</SelectItem>
            <SelectItem value="createdAt">Created</SelectItem>
            <SelectItem value="id">ID</SelectItem>
          </SelectContent>
        </Select>

        <Select :model-value="sortOrder" @update:model-value="handleSortOrderChange">
          <SelectTrigger class="h-[42px] min-w-[120px] text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div class="overflow-hidden rounded-[18px] border border-[#e4e4e4] bg-white max-[1100px]:overflow-x-auto">
      <Table class="w-full table-fixed border-collapse max-[1100px]:min-w-[780px]">
        <TableHeader>
          <TableRow>
            <TableHead class="border-b border-[#e4e4e4] bg-[#f7f7f7] px-[14px] py-[11px] text-left text-[13px] font-bold text-[#666666]">User</TableHead>
            <TableHead class="border-b border-[#e4e4e4] bg-[#f7f7f7] px-[14px] py-[11px] text-left text-[13px] font-bold text-[#666666]">Plan</TableHead>
            <TableHead class="border-b border-[#e4e4e4] bg-[#f7f7f7] px-[14px] py-[11px] text-left text-[13px] font-bold text-[#666666]">Status</TableHead>
            <TableHead class="border-b border-[#e4e4e4] bg-[#f7f7f7] px-[14px] py-[11px] text-left text-[13px] font-bold text-[#666666]">Created</TableHead>
            <TableHead class="border-b border-[#e4e4e4] bg-[#f7f7f7] px-[14px] py-[11px] text-left text-[13px] font-bold text-[#666666]">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow v-if="paginatedUsers.length === 0">
            <TableCell :colspan="5" class="px-[14px] py-5 text-center text-[13px] text-[#777777]">No matching users found.</TableCell>
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
                >Block</Button>
                <Button
                  v-if="user.availableActions.includes('unblock')"
                  variant="secondary"
                  size="sm"
                  :disabled="actionLoading === user.id"
                  @click="handleUnblock(user.id)"
                >Unblock</Button>
                <Button
                  v-if="user.availableActions.includes('delete')"
                  variant="destructive"
                  size="sm"
                  :disabled="actionLoading === user.id"
                  @click="handleDelete(user.id)"
                >Delete</Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2 text-xs text-[#666666]">
        <span>Rows per page</span>
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
        Page {{ currentPage }} of {{ totalPages }}
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

const USER_TYPE_MAP: Record<string, string> = {
  '1': 'Student',
  '2': 'Institution',
  '3': 'Admin',
}

interface UserRow {
  id: number
  name: string
  email: string
  role: string
  status: string
  createdAt: string
  availableActions: string[]
}

function mapUser(u: AdminUser): UserRow {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: USER_TYPE_MAP[u.type] ?? 'Unknown',
    status: u.status.charAt(0).toUpperCase() + u.status.slice(1),
    createdAt: new Date(u.created_at).toLocaleDateString(),
    availableActions: u.available_actions,
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
  } catch (e: any) {
    toast.error(e?.response?.data?.detail?.message ?? 'Failed to load users')
  } finally {
    loadingUsers.value = false
  }
}

async function handleBlock(userId: number) {
  actionLoading.value = userId
  try {
    await blockUser(userId)
    toast.success('User blocked')
    await loadUsers()
  } catch (e: any) {
    toast.error(e?.response?.data?.detail?.message ?? 'Failed to block user')
  } finally {
    actionLoading.value = null
  }
}

async function handleUnblock(userId: number) {
  actionLoading.value = userId
  try {
    await unblockUser(userId)
    toast.success('User unblocked')
    await loadUsers()
  } catch (e: any) {
    toast.error(e?.response?.data?.detail?.message ?? 'Failed to unblock user')
  } finally {
    actionLoading.value = null
  }
}

async function handleDelete(userId: number) {
  if (!confirm('Are you sure you want to permanently delete this user?')) return
  actionLoading.value = userId
  try {
    await deleteUser(userId)
    toast.success('User deleted')
    await loadUsers()
  } catch (e: any) {
    toast.error(e?.response?.data?.detail?.message ?? 'Failed to delete user')
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