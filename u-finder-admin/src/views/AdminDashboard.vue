<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="brand">
        <div class="logo">UF</div>
        <div>
          <div class="brand-title">U-Finder Admin</div>
          <p class="brand-sub">LLM School Finder</p>
        </div>
      </div>

      <div class="nav">
        <div class="nav-item">
          <span class="nav-icon">
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <rect x="8" y="8" width="32" height="52" rx="8" ry="8" fill="#111111" />
              <rect x="58" y="8" width="32" height="24" rx="8" ry="8" fill="#111111" />
              <rect x="8" y="68" width="32" height="24" rx="8" ry="8" fill="#111111" />
              <rect x="58" y="48" width="32" height="44" rx="8" ry="8" fill="#111111" />
            </svg>
          </span>
          <span>Dashboard</span>
        </div>
      </div>
    </aside>

    <main class="main">
      <div class="topbar">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-desc">
            Overview of users, sessions, cost usage, and system activity.
          </p>
        </div>

        <div class="top-actions">
          <button class="btn">Export</button>
          <button class="btn">Refresh</button>
          <button class="btn btn-primary">Save</button>
        </div>
      </div>

      <section class="kpis">
        <div class="kpi">
          <div class="kpi-label">Total Users</div>
          <div class="kpi-value">1,284</div>
          <div class="kpi-hint">+32 this week</div>
        </div>

        <div class="kpi">
          <div class="kpi-label">Active Sessions</div>
          <div class="kpi-value">87</div>
          <div class="kpi-hint">last 15 minutes</div>
        </div>

        <div class="kpi">
          <div class="kpi-label">LLM Cost (Today)</div>
          <div class="kpi-value">$18.42</div>
          <div class="kpi-hint">budget: $40/day</div>
        </div>

        <div class="kpi">
          <div class="kpi-label">Reports Received</div>
          <div class="kpi-value">14</div>
          <div class="kpi-hint">needs review</div>
        </div>
      </section>

      <section class="content">
        <div class="panel">
          <div class="panel-inner">
            <div class="panel-header">
              <div>
                <h2 class="panel-title">Recent Users</h2>
                <p class="panel-sub">
                  Quick view for checking user pages, status, and last active time.
                </p>
              </div>

              <div class="small-pill">View All</div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Active</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>
                    <div class="user-name">Albert Wolff</div>
                    <div class="user-meta mono">albert@ufinder.com</div>
                    <div class="user-meta mono">· #1024</div>
                  </td>
                  <td><span class="badge">Student</span></td>
                  <td><span class="badge">Active</span></td>
                  <td class="muted">3 min<br />ago</td>
                  <td>
                    <div class="actions-cell">
                      <button class="btn-sm">Block</button>
                      <button class="btn-sm">Delete</button>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td>
                    <div class="user-name">Kai-Hsiang Shen</div>
                    <div class="user-meta mono">kaihs@ufinder.com</div>
                    <div class="user-meta mono">· #1188</div>
                  </td>
                  <td><span class="badge">Student</span></td>
                  <td><span class="badge">Pending</span></td>
                  <td class="muted">1 hour<br />ago</td>
                  <td>
                    <div class="actions-cell">
                      <button class="btn-sm">Block</button>
                      <button class="btn-sm">Delete</button>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td>
                    <div class="user-name">Spam Bot 03</div>
                    <div class="user-meta mono">bot03@temp.com</div>
                    <div class="user-meta mono">· #2003</div>
                  </td>
                  <td><span class="badge">Unknown</span></td>
                  <td><span class="badge">Blocked</span></td>
                  <td class="muted">2 days<br />ago</td>
                  <td>
                    <div class="actions-cell">
                      <button class="btn-sm">Unblock</button>
                      <button class="btn-sm">Delete</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <div style="margin-top: 18px; color: #555; font-size: 13px">
              Tip: “Recent Users” shows the latest accounts for quick moderation and account handling.
            </div>
          </div>
        </div>

        <div class="right-col">
          <div class="panel">
            <div class="panel-header panel-header-pad">
              <div>
                <h2 class="panel-title">Model Cost Snapshot</h2>
              </div>
              <div class="small-pill">Today</div>
            </div>

            <div class="panel-inner">
              <div class="field-row">
                <div class="field">
                  <label>Model</label>
                  <select>
                    <option>gpt-4.1-mini</option>
                  </select>
                </div>

                <div class="field">
                  <label>Time Range</label>
                  <select>
                    <option>24 hours</option>
                    <option>One week</option>
                    <option>One month</option>
                  </select>
                </div>
              </div>

              <div class="mini-cards">
                <div class="mini-card">
                  <div class="mini-label">Total Requests</div>
                  <div class="mini-value">3,912</div>
                  <div class="mini-hint">avg latency: 1.8s</div>
                </div>

                <div class="mini-card">
                  <div class="mini-label">Estimated Cost</div>
                  <div class="mini-value">$18.42</div>
                  <div class="mini-hint">tokens: 9.7M</div>
                </div>
              </div>

              <div class="top-actions">
                <button class="btn">Download</button>
                <button class="btn btn-primary">Set Alert</button>
              </div>
            </div>
          </div>

          <div class="panel">
            <div class="panel-header panel-header-pad">
              <div>
                <h2 class="panel-title">System Logs Preview</h2>
              </div>
              <div class="small-pill">Live</div>
            </div>

            <div class="panel-inner">
              <div class="field-row" style="margin-bottom: 16px">
                <div class="field">
                  <label for="log-date">Date</label>
                  <input id="log-date" type="date" v-model="selectedDate" />
                </div>

                <div class="field">
                  <label for="log-level">Level</label>
                  <select id="log-level" v-model="selectedLevel">
                    <option value="ALL">All</option>
                    <option value="INFO">INFO</option>
                    <option value="WARN">WARN</option>
                    <option value="ERROR">ERROR</option>
                  </select>
                </div>
              </div>

              <div class="log-box">
                <div v-if="filteredLogs.length === 0" class="empty-state">
                  No logs found for the selected filters.
                </div>

                <div
                  v-for="(log, index) in filteredLogs"
                  :key="index"
                  class="log-row"
                >
                  <div class="mono">{{ log.time }}</div>
                  <div><span class="log-pill">{{ log.level }}</span></div>
                  <div>{{ log.message }}</div>
                </div>
              </div>

              <div class="helper-text">
                Filter logs by exact date and log level.
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const today = new Date()
const selectedDate = ref(
  `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate(),
  ).padStart(2, '0')}`,
)
const selectedLevel = ref('ALL')

const logs = ref([
  {
    date: '2026-03-10',
    time: '17:41:12',
    level: 'INFO',
    message: 'User #1188 requested verification code',
  },
  {
    date: '2026-03-10',
    time: '17:40:03',
    level: 'WARN',
    message: 'Daily budget reached 80% threshold',
  },
  {
    date: '2026-03-10',
    time: '17:38:55',
    level: 'ERROR',
    message: 'LLM timeout on /recommend (retry succeeded)',
  },
  {
    date: '2026-03-09',
    time: '15:12:01',
    level: 'INFO',
    message: 'Admin exported dashboard report',
  },
  {
    date: '2026-03-09',
    time: '13:48:26',
    level: 'WARN',
    message: 'Multiple failed login attempts detected',
  },
  {
    date: '2026-03-08',
    time: '09:21:14',
    level: 'ERROR',
    message: 'Profile parsing service temporarily unavailable',
  },
])

const filteredLogs = computed(() => {
  return logs.value.filter((log) => {
    const matchDate = !selectedDate.value || log.date === selectedDate.value
    const matchLevel =
      selectedLevel.value === 'ALL' || log.level === selectedLevel.value

    return matchDate && matchLevel
  })
})
</script>

<style scoped>
:global(body) {
  margin: 0;
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Helvetica,
    Arial,
    sans-serif;
  background: #f6f6f6;
  color: #111111;
}

* {
  box-sizing: border-box;
}

.layout {
  display: grid;
  grid-template-columns: 310px 1fr;
  min-height: 100vh;
}

.sidebar {
  background: #fff;
  border-right: 1px solid #e6e6e6;
  padding: 22px 14px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 10px 18px;
  border-bottom: 1px solid #e6e6e6;
  margin-bottom: 20px;
}

.logo {
  width: 48px;
  height: 48px;
  border: 1px solid #d8d8d8;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 800;
  background: #fafafa;
}

.brand-title {
  font-size: 18px;
  font-weight: 800;
  margin: 0;
  line-height: 1.1;
}

.brand-sub {
  margin: 4px 0 0;
  color: #6b6b6b;
  font-size: 12px;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 18px;
  background: #efefef;
  border: 1px solid #e6e6e6;
  font-size: 16px;
  font-weight: 500;
  width: 100%;
  max-width: 100%;
}

.nav-icon {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon svg {
  width: 20px;
  height: 20px;
  display: block;
}

.main {
  padding: 28px 34px 34px;
}

.topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

.page-title {
  font-size: 38px;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.03em;
}

.page-desc {
  margin: 10px 0 0;
  font-size: 16px;
  color: #6b6b6b;
  line-height: 1.5;
}

.top-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  border: 1px solid #d8d8d8;
  background: #fff;
  padding: 11px 18px;
  border-radius: 18px;
  font-size: 14px;
  cursor: pointer;
  color: #111;
}

.btn:hover {
  background: #fafafa;
}

.btn-primary {
  background: #111;
  color: #fff;
  border-color: #111;
}

.btn-primary:hover {
  background: #222;
}

.kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 20px;
}

.kpi {
  background: #ffffff;
  border: 1px solid #e6e6e6;
  border-radius: 22px;
  padding: 18px 18px 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
}

.kpi-label {
  color: #6b6b6b;
  font-size: 14px;
  margin-bottom: 8px;
}

.kpi-value {
  font-size: 22px;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 6px;
}

.kpi-hint {
  color: #6b6b6b;
  font-size: 13px;
}

.content {
  display: grid;
  grid-template-columns: 1.55fr 1fr;
  gap: 18px;
  align-items: start;
}

.right-col {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.panel {
  background: #ffffff;
  border: 1px solid #e6e6e6;
  border-radius: 26px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.panel-inner {
  padding: 20px 20px 18px;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.panel-header-pad {
  padding: 20px 20px 0;
}

.panel-title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.panel-sub {
  margin: 6px 0 0;
  color: #6b6b6b;
  font-size: 13px;
  line-height: 1.45;
}

.small-pill {
  padding: 7px 14px;
  border-radius: 999px;
  background: #f3f3f3;
  border: 1px solid #e6e6e6;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  overflow: hidden;
  border: 1px solid #e6e6e6;
  border-radius: 18px;
}

thead th {
  text-align: left;
  font-size: 12px;
  color: #6b6b6b;
  font-weight: 700;
  background: #f7f7f7;
  padding: 14px 14px;
  border-bottom: 1px solid #e6e6e6;
}

tbody td {
  padding: 14px;
  border-bottom: 1px solid #e6e6e6;
  vertical-align: top;
  font-size: 14px;
}

tbody tr:last-child td {
  border-bottom: none;
}

.user-name {
  font-size: 18px;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 2px;
}

.user-meta {
  font-size: 12px;
  color: #6b6b6b;
  line-height: 1.35;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f2f2f2;
  border: 1px solid #d8d8d8;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 13px;
  line-height: 1;
  white-space: nowrap;
}

.muted {
  color: #6b6b6b;
}

.actions-cell {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-sm {
  border: 1px solid #d8d8d8;
  background: #fff;
  padding: 9px 14px;
  border-radius: 18px;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}

.btn-sm:hover {
  background: #fafafa;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 14px;
}

.field label {
  display: block;
  font-size: 13px;
  color: #6b6b6b;
  margin-bottom: 8px;
}

.field select,
.field input {
  width: 100%;
  border: 1px solid #d8d8d8;
  background: #fafafa;
  border-radius: 18px;
  padding: 12px 14px;
  font-size: 14px;
  outline: none;
}

.field select:focus,
.field input:focus {
  border-color: #bdbdbd;
  background: #fff;
}

.mini-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 16px;
}

.mini-card {
  border: 1px solid #e6e6e6;
  border-radius: 20px;
  padding: 18px;
  background: #fff;
}

.mini-label {
  color: #6b6b6b;
  font-size: 14px;
  margin-bottom: 8px;
}

.mini-value {
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 6px;
}

.mini-hint {
  color: #6b6b6b;
  font-size: 13px;
}

.log-box {
  border: 1px solid #e6e6e6;
  border-radius: 20px;
  padding: 10px 14px;
  background: #fafafa;
}

.log-row {
  display: grid;
  grid-template-columns: 95px 90px 1fr;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px dashed #d8d8d8;
  align-items: start;
  font-size: 14px;
}

.log-row:last-child {
  border-bottom: none;
}

.log-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d8d8d8;
  border-radius: 999px;
  background: #fff;
  padding: 4px 10px;
  font-size: 12px;
  width: max-content;
}

.helper-text {
  margin-top: 12px;
  font-size: 13px;
  color: #6b6b6b;
}

.empty-state {
  padding: 20px 6px;
  color: #6b6b6b;
  font-size: 14px;
}

.mono {
  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    'Liberation Mono',
    'Courier New',
    monospace;
}

@media (max-width: 1280px) {
  .kpis {
    grid-template-columns: repeat(2, 1fr);
  }

  .content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 860px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    display: none;
  }

  .main {
    padding: 18px;
  }

  .field-row {
    grid-template-columns: 1fr;
  }

  .mini-cards {
    grid-template-columns: 1fr;
  }

  .kpis {
    grid-template-columns: 1fr;
  }

  .topbar {
    flex-direction: column;
  }

  .log-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
</style>