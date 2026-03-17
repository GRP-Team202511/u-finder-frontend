<template>
  <div class="dashboard-page">
    <div class="dashboard-topbar">
      <div>
        <h1 class="dashboard-title">Dashboard</h1>
        <p class="dashboard-subtitle">
          Overview of users, sessions, cost usage, and system activity.
        </p>
      </div>

      <div class="topbar-actions">
        <Button variant="outline" size="lg" class="topbar-btn" @click="handleExport">
          Export
        </Button>
        <Button variant="outline" size="lg" class="topbar-btn" @click="loadDashboard">
          Refresh
        </Button>
        <Button variant="default" size="lg" class="topbar-btn" @click="handleSave">
          Save
        </Button>
      </div>
    </div>

    <div v-if="loading" class="dashboard-state">Loading dashboard...</div>
    <div v-else-if="error" class="dashboard-state dashboard-state--error">
      {{ error }}
    </div>
    <template v-else>
      <div class="stats-grid stats-grid--two">
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

      <div class="section-stack">
        <RecentUsersCard :users="dashboardData?.recentUsers ?? []" />
        <ModelCostSnapshotCard :model-cost="dashboardData?.modelCost" />
        <SystemLogsPreviewCard :logs="dashboardData?.systemLogs ?? []" />
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
import { fetchDashboard, type DashboardResponse } from '@/api/dashboard'

const loading = ref(false)
const error = ref('')
const dashboardData = ref<DashboardResponse | null>(null)

const formattedCost = computed(() => {
  const cost = dashboardData.value?.summary.llmCostToday ?? 0
  return `$${cost.toFixed(2)}`
})

async function loadDashboard() {
  loading.value = true
  error.value = ''

  try {
    dashboardData.value = await fetchDashboard()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load dashboard'
  } finally {
    loading.value = false
  }
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

<style scoped>
.dashboard-page {
  width: 100%;
  min-height: 100vh;
  padding: 24px 24px 32px;
  background: #f5f5f5;
  box-sizing: border-box;
}

.dashboard-topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
}

.dashboard-title {
  margin: 0;
  font-size: 48px;
  line-height: 1;
  font-weight: 900;
  color: #111111;
  letter-spacing: -0.03em;
}

.dashboard-subtitle {
  margin: 10px 0 0;
  font-size: 14px;
  line-height: 1.4;
  color: #6b6b6b;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.topbar-btn {
  min-height: 40px;
  font-size: 13px;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  gap: 14px;
  margin-bottom: 20px;
}

.stats-grid--two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.section-stack {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dashboard-state {
  padding: 20px;
  font-size: 14px;
  color: #555555;
}

.dashboard-state--error {
  color: #c62828;
}

@media (max-width: 1024px) {
  .dashboard-title {
    font-size: 40px;
  }

  .dashboard-topbar {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .dashboard-page {
    padding: 18px;
  }

  .stats-grid--two {
    grid-template-columns: 1fr;
  }

  .dashboard-title {
    font-size: 36px;
  }
}
</style>