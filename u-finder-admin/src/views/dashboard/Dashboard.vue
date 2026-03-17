<template>
  <div class="min-h-screen w-full bg-[#f5f5f5] box-border px-6 pb-8 pt-6 max-md:px-[18px]">
    <div class="mb-[18px] flex items-start justify-between gap-[18px] max-lg:flex-col">
      <div>
        <h1 class="m-0 text-5xl font-black leading-none tracking-[-0.03em] text-[#111111] max-lg:text-[40px] max-md:text-4xl">Dashboard</h1>
        <p class="mt-[10px] text-sm leading-[1.4] text-[#6b6b6b]">
          Overview of users, sessions, cost usage, and system activity.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-[10px]">
        <Button variant="outline" size="lg" class="min-h-10 text-[13px] font-semibold" @click="handleExport">
          Export
        </Button>
        <Button variant="outline" size="lg" class="min-h-10 text-[13px] font-semibold" @click="loadDashboard">
          Refresh
        </Button>
        <Button variant="default" size="lg" class="min-h-10 text-[13px] font-semibold" @click="handleSave">
          Save
        </Button>
      </div>
    </div>

    <div v-if="loading" class="p-5 text-sm text-[#555555]">Loading dashboard...</div>
    <div v-else-if="error" class="p-5 text-sm text-[#c62828]">
      {{ error }}
    </div>
    <template v-else>
      <div class="mb-5 grid gap-[14px] md:grid-cols-2">
        <StatCard
          title="Total Users"
          :value="dashboardData?.summary.totalUsers ?? 0"
          :subtitle="dashboardData?.summary.totalUsersSubtitle ?? ''"
        />
        <StatCard
          title="LLM Cost (Today)"
          :value="formattedCost"
          :subtitle="dashboardData?.summary.llmCostSubtitle ?? ''"
        />
      </div>

      <div class="flex flex-col gap-5">
        <RecentUsersCard />
        <ModelCostSnapshotCard
          :model-cost="dashboardData?.modelCost"
          @filter-change="handleCostFilterChange"
        />
        <SystemLogsPreviewCard
          :logs="dashboardData?.systemLogs ?? []"
          @filter-change="handleLogFilterChange"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Button } from '@/components/ui/button'
import StatCard from '@/components/admin/dashboard/SummaryCard.vue'
import RecentUsersCard from '@/components/admin/dashboard/RecentUser.vue'
import ModelCostSnapshotCard from '@/components/admin/dashboard/ModuleCost.vue'
import SystemLogsPreviewCard from '@/components/admin/dashboard/SystemLog.vue'
import { fetchDashboard, type DashboardResponse, type DashboardFetchParams } from '@/api/dashboard'

const loading = ref(false)
const error = ref('')
const dashboardData = ref<DashboardResponse | null>(null)
const filters = ref<DashboardFetchParams>({})

const formattedCost = computed(() => {
  const cost = dashboardData.value?.summary.llmCostToday ?? 0
  return `$${cost.toFixed(2)}`
})

async function loadDashboard() {
  loading.value = true
  error.value = ''

  try {
    dashboardData.value = await fetchDashboard(filters.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load dashboard'
  } finally {
    loading.value = false
  }
}

function handleLogFilterChange(params: { logs_date?: string; logs_level?: string }) {
  filters.value = { ...filters.value, ...params }
  loadDashboard()
}

function handleCostFilterChange(params: { cost_model?: string; cost_time_range?: string }) {
  filters.value = { ...filters.value, ...params }
  loadDashboard()
}

function handleExport() {
  console.log('export dashboard')
}

function handleSave() {
  console.log('save dashboard settings')
}

onMounted(() => {
  loadDashboard()
})
</script>