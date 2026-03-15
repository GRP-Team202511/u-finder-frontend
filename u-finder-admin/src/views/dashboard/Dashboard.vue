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
        <Button variant="outline" size="lg" class="topbar-btn">Export</Button>
        <Button variant="outline" size="lg" class="topbar-btn">Refresh</Button>
        <Button variant="default" size="lg" class="topbar-btn">Save</Button>
      </div>
    </div>

    <div class="stats-grid stats-grid--two">
      <StatCard
        title="Total Users"
        value="1,284"
        subtitle="+32 this week"
      />
      <StatCard
        title="LLM Cost (Today)"
        value="$18.42"
        subtitle="budget: $40/day"
      />
    </div>

    <div class="section-stack">
      <RecentUsersCard />
      <ModelCostSnapshotCard />
      <SystemLogsPreviewCard />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import StatCard from '@/components/admin/dashboard/SummaryCard.vue'
import RecentUsersCard from '@/components/admin/dashboard/RecentUser.vue'
import ModelCostSnapshotCard from '@/components/admin/dashboard/ModuleCost.vue'
import SystemLogsPreviewCard from '@/components/admin/dashboard/SystemLog.vue'
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