<template>
  <div class="min-h-screen w-full box-border px-6 pb-8 pt-6 max-md:px-[18px]">
    <div class="mb-[18px] flex items-start justify-between gap-[18px] max-lg:flex-col">
      <div>
        <h1 class="m-0 text-5xl font-black leading-none tracking-[-0.03em] text-[#111111] dark:text-foreground max-lg:text-[40px] max-md:text-4xl">{{ t('dashboard.page.title') }}</h1>
        <p class="mt-[10px] text-sm leading-[1.4] text-[#6b6b6b] dark:text-muted-foreground">
          {{ t('dashboard.page.subtitle') }}
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-[10px]">
        <Button variant="outline" size="lg" class="min-h-10 text-[13px] font-semibold" @click="loadDashboard">
          {{ t('dashboard.page.refresh') }}
        </Button>
      </div>
    </div>

    <div v-if="initialLoading" class="p-5 text-sm text-[#555555] dark:text-muted-foreground">{{ t('dashboard.page.loading') }}</div>
    <div v-else-if="error && !dashboardData" class="p-5 text-sm text-[#c62828] dark:text-red-400">
      {{ error }}
    </div>
    <template v-else>
      <div class="mb-5 grid gap-[14px] md:grid-cols-2">
        <StatCard
          :title="t('dashboard.summary.totalUsers')"
          :value="dashboardData?.summary.totalUsers ?? 0"
          :subtitle="dashboardData?.summary.totalUsersSubtitle ?? ''"
        />
        <StatCard
          :title="t('dashboard.summary.llmCostToday')"
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
          :logs-total-count="dashboardData?.logsTotalCount ?? 0"
          @filter-change="handleLogFilterChange"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import StatCard from '@/components/admin/dashboard/SummaryCard.vue'
import RecentUsersCard from '@/components/admin/dashboard/RecentUser.vue'
import ModelCostSnapshotCard from '@/components/admin/dashboard/ModuleCost.vue'
import SystemLogsPreviewCard from '@/components/admin/dashboard/SystemLog.vue'
import { fetchDashboard, type DashboardResponse, type DashboardFetchParams } from '@/api/dashboard'

const { t } = useI18n()

const loading = ref(false)
const error = ref('')
const dashboardData = ref<DashboardResponse | null>(null)
const filters = ref<DashboardFetchParams>({})

const initialLoading = computed(() => loading.value && !dashboardData.value)

const formattedCost = computed(() => {
  const cost = dashboardData.value?.summary.llmCostToday ?? 0
  return `¥${cost.toFixed(2)}`
})

async function loadDashboard() {
  loading.value = true
  error.value = ''

  try {
    dashboardData.value = await fetchDashboard(filters.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('dashboard.page.loadError')
  } finally {
    loading.value = false
  }
}

function handleLogFilterChange(params: {
  logs_date?: string
  logs_level?: string
  logs_page?: number
  logs_per_page?: number
}) {
  filters.value = { ...filters.value, ...params }
  loadDashboard()
}

function handleCostFilterChange(params: { cost_model?: string; cost_date?: string }) {
  filters.value = { ...filters.value, ...params }
  loadDashboard()
}

onMounted(() => {
  loadDashboard()
})
</script>