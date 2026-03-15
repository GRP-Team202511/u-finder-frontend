<template>
  <section class="panel">
    <div class="panel__header">
      <div>
        <h2 class="panel__title">Recent Users</h2>
        <p class="panel__desc">
          Quick view for checking user pages, status, and last active time.
        </p>
      </div>
    </div>

    <div class="toolbar">
      <div class="search-wrap">
        <Input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="Search users..."
        />
      </div>

      <div class="sort-wrap">
        <label class="sort-label">Sort by</label>
        <Select :model-value="sortKey" @update:model-value="handleSortKeyChange">
          <SelectTrigger class="sort-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="role">Plan</SelectItem>
            <SelectItem value="status">Status</SelectItem>
            <SelectItem value="lastActiveMinutes">Last Active</SelectItem>
            <SelectItem value="id">ID</SelectItem>
          </SelectContent>
        </Select>

        <Select :model-value="sortOrder" @update:model-value="handleSortOrderChange">
          <SelectTrigger class="sort-select sort-select--small">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div class="table-wrap">
      <Table class="users-table">
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow v-if="paginatedUsers.length === 0">
            <TableCell :colspan="5" class="empty-cell">No matching users found.</TableCell>
          </TableRow>

          <TableRow v-for="user in paginatedUsers" :key="user.id">
            <TableCell>
              <div class="user-block">
                <div class="user-name">{{ user.name }}</div>
                <div class="user-meta">{{ user.email }}</div>
                <div class="user-meta">#{{ user.id }}</div>
              </div>
            </TableCell>

            <TableCell>
              <span class="pill">{{ user.role }}</span>
            </TableCell>

            <TableCell>
              <span class="pill">{{ user.status }}</span>
            </TableCell>

            <TableCell class="last-active">
              {{ user.lastActive }}
            </TableCell>

            <TableCell>
              <div class="action-group">
                <Button variant="secondary" size="sm">
                  {{ user.status === 'Blocked' ? 'Unblock' : 'Block' }}
                </Button>
                <Button variant="destructive" size="sm">Delete</Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div class="pagination">
      <div class="rows">
        <span>Rows per page</span>
        <Select :model-value="String(rowsPerPage)" @update:model-value="handleRowsPerPageChange">
          <SelectTrigger class="rows-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="page-info">
        Page {{ currentPage }} of {{ totalPages }}
      </div>

      <div class="page-buttons">
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
import { computed, ref, watch } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface UserRow {
  id: number
  name: string
  email: string
  role: string
  status: string
  lastActive: string
  lastActiveMinutes: number
}

const users: UserRow[] = [
  {
    id: 1024,
    name: 'Albert Wolff',
    email: 'albert@ufinder.com',
    role: 'Student',
    status: 'Active',
    lastActive: '3 min ago',
    lastActiveMinutes: 3
  },
  {
    id: 1188,
    name: 'Kai-Hsiang Shen',
    email: 'kaihs@ufinder.com',
    role: 'Student',
    status: 'Pending',
    lastActive: '1 hour ago',
    lastActiveMinutes: 60
  },
  {
    id: 2003,
    name: 'Spam Bot 03',
    email: 'bot03@temp.com',
    role: 'Unknown',
    status: 'Blocked',
    lastActive: '2 days ago',
    lastActiveMinutes: 2880
  },
  {
    id: 1452,
    name: 'Emily Carter',
    email: 'emily@ufinder.com',
    role: 'Student',
    status: 'Active',
    lastActive: '12 min ago',
    lastActiveMinutes: 12
  },
  {
    id: 1567,
    name: 'Ryan Chen',
    email: 'ryan@ufinder.com',
    role: 'Admin',
    status: 'Active',
    lastActive: '25 min ago',
    lastActiveMinutes: 25
  },
  {
    id: 1789,
    name: 'Sophia Lin',
    email: 'sophia@ufinder.com',
    role: 'Student',
    status: 'Pending',
    lastActive: '4 hours ago',
    lastActiveMinutes: 240
  }
]

const searchQuery = ref('')
const sortKey = ref<'name' | 'role' | 'status' | 'lastActiveMinutes' | 'id'>('name')
const sortOrder = ref<'asc' | 'desc'>('asc')

const currentPage = ref(1)
const rowsPerPage = ref(5)

const filteredUsers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) return users

  return users.filter((user) => {
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query) ||
      user.status.toLowerCase().includes(query) ||
      String(user.id).includes(query)
    )
  })
})

const sortedUsers = computed(() => {
  const copied = [...filteredUsers.value]

  copied.sort((a, b) => {
    const key = sortKey.value
    const aVal = a[key]
    const bVal = b[key]

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder.value === 'asc' ? aVal - bVal : bVal - aVal
    }

    const aStr = String(aVal).toLowerCase()
    const bStr = String(bVal).toLowerCase()

    if (aStr < bStr) return sortOrder.value === 'asc' ? -1 : 1
    if (aStr > bStr) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })

  return copied
})

const totalPages = computed(() => {
  if (sortedUsers.value.length === 0) return 0
  return Math.ceil(sortedUsers.value.length / rowsPerPage.value)
})

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value
  const end = start + rowsPerPage.value
  return sortedUsers.value.slice(start, end)
})

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

function handleSortKeyChange(value: any) {
  if (typeof value !== 'string') return
  sortKey.value = value as 'name' | 'role' | 'status' | 'lastActiveMinutes' | 'id'
}

function handleSortOrderChange(value: any) {
  if (value !== 'asc' && value !== 'desc') return
  sortOrder.value = value
}

function handleRowsPerPageChange(value: any) {
  const next = Number(value)
  if ([5, 10, 20].includes(next)) {
    rowsPerPage.value = next
  }
}

watch([searchQuery, sortKey, sortOrder, rowsPerPage], () => {
  currentPage.value = 1
})
</script>

<style scoped>
.panel {
  background: #ffffff;
  border: 1px solid #dddddd;
  border-radius: 28px;
  padding: 20px;
  box-sizing: border-box;
}

.panel__header {
  margin-bottom: 12px;
}

.panel__title {
  margin: 0;
  font-size: 22px;
  line-height: 1.15;
  font-weight: 800;
  color: #111111;
}

.panel__desc {
  margin: 6px 0 0;
  font-size: 13px;
  color: #6b6b6b;
  line-height: 1.4;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.search-wrap {
  flex: 1;
  min-width: 220px;
}

.search-input {
  width: 100%;
  height: 42px;
  border-radius: 14px;
  border: 1px solid #d8d8d8;
  background: #ffffff;
  padding: 0 14px;
  font-size: 13px;
  color: #111111;
  outline: none;
  box-sizing: border-box;
}

.sort-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.sort-label {
  font-size: 13px;
  color: #666666;
}

.sort-select {
  height: 42px;
  min-width: 120px;
  font-size: 13px;
}

.sort-select--small {
  min-width: 120px;
}

.table-wrap {
  border: 1px solid #e4e4e4;
  border-radius: 18px;
  overflow: hidden;
  background: #ffffff;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.users-table th {
  text-align: left;
  background: #f7f7f7;
  color: #666666;
  font-size: 13px;
  font-weight: 700;
  padding: 11px 14px;
  border-bottom: 1px solid #e4e4e4;
}

.users-table td {
  padding: 11px 14px;
  border-bottom: 1px solid #eeeeee;
  vertical-align: middle;
}

.users-table tbody tr:last-child td {
  border-bottom: none;
}

.user-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: 14px;
  line-height: 1.2;
  font-weight: 700;
  color: #111111;
}

.user-meta {
  font-size: 12px;
  line-height: 1.25;
  color: #777777;
}

.pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 78px;
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid #dddddd;
  background: #f8f8f8;
  font-size: 12px;
  color: #222222;
}

.last-active {
  font-size: 13px;
  color: #555555;
  line-height: 1.3;
}

.action-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.empty-cell {
  text-align: center;
  color: #777777;
  font-size: 13px;
  padding: 20px 14px;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.rows {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666666;
}

.rows-select {
  height: 34px;
  min-width: 64px;
  font-size: 12px;
}

.page-info {
  font-size: 12px;
  color: #666666;
}

.page-buttons {
  display: flex;
  align-items: center;
  gap: 6px;
}

@media (max-width: 1100px) {
  .table-wrap {
    overflow-x: auto;
  }

  .users-table {
    min-width: 780px;
  }
}
</style>