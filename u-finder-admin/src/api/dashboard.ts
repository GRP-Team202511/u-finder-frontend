// This code was completed by GRP Team 2025.11.
import http from './http'

// ── Backend response types ──────────────────────────────────────────

export interface AdminUser {
  id: number
  name: string
  email: string
  type: string
  status: string
  created_at: string
  available_actions: string[]
}

interface BackendDashboardSummary {
  total_users: number
  total_users_delta_week?: number | null
  llm_cost_today: {
    currency: string
    amount: number
    budget_per_day?: number | null
  }
  recent_users: AdminUser[]
  recent_logs: Array<{
    time: string
    level: string
    message: string
  }>
  logs_total_count: number
  model_cost_snapshot: {
    total_requests: number
    avg_latency_seconds?: number | null
    tokens_total: number
    estimated_cost: { currency: string; amount: number }
  }
}

// ── Frontend display types (kept for backward compat with components) ─

export interface SummaryData {
  totalUsers: number
  totalUsersSubtitle: string
  llmCostToday: number
  llmCostSubtitle: string
}

export interface RecentUserItem {
  id: number
  name: string
  email: string
  role: string
  status: string
  lastActive: string
  lastActiveMinutes: number
}

export interface ModelCostData {
  selectedModel: string
  selectedRange: string
  totalRequests: number
  avgLatency: string
  estimatedCost: number
  tokens: string
}

export interface SystemLogItem {
  date: string
  time: string
  level: 'INFO' | 'WARN' | 'ERROR'
  message: string
}

export interface DashboardResponse {
  summary: SummaryData
  recentUsers: RecentUserItem[]
  modelCost: ModelCostData
  systemLogs: SystemLogItem[]
  logsTotalCount: number
}

// ── Mapping helpers ─────────────────────────────────────────────────

export const USER_TYPE_MAP: Record<string, string> = {
  '1': 'User',
  '2': 'Pro User',
  '3': 'Admin',
  '4': 'Super Admin',
}

function toTitleCase(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s
}

function formatTimeAgo(dateStr: string): { text: string; minutes: number } {
  const diff = Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000))
  if (diff < 1) return { text: 'just now', minutes: 0 }
  if (diff < 60) return { text: `${diff} min ago`, minutes: diff }
  const h = Math.floor(diff / 60)
  if (h < 24) return { text: `${h} hour${h > 1 ? 's' : ''} ago`, minutes: diff }
  const d = Math.floor(h / 24)
  return { text: `${d} day${d > 1 ? 's' : ''} ago`, minutes: diff }
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function mapRawToDashboard(raw: BackendDashboardSummary): DashboardResponse {
  return {
    summary: {
      totalUsers: raw.total_users,
      totalUsersSubtitle: `+${raw.total_users_delta_week ?? 0} this week`,
      llmCostToday: raw.llm_cost_today?.amount ?? 0,
      llmCostSubtitle:
        raw.llm_cost_today?.budget_per_day != null
          ? `budget: ¥${raw.llm_cost_today.budget_per_day}/day`
          : '',
    },
    recentUsers: (raw.recent_users ?? []).map((u) => {
      const ago = formatTimeAgo(u.created_at)
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: USER_TYPE_MAP[u.type] ?? 'Unknown',
        status: toTitleCase(u.status),
        lastActive: ago.text,
        lastActiveMinutes: ago.minutes,
      }
    }),
    modelCost: {
      selectedModel: 'chat',
      selectedRange: 'last_24h',
      totalRequests: raw.model_cost_snapshot?.total_requests ?? 0,
      avgLatency:
        raw.model_cost_snapshot?.avg_latency_seconds != null
          ? `${raw.model_cost_snapshot.avg_latency_seconds.toFixed(2)}s`
          : 'N/A',
      estimatedCost: raw.model_cost_snapshot?.estimated_cost?.amount ?? 0,
      tokens: formatTokens(raw.model_cost_snapshot?.tokens_total ?? 0),
    },
    systemLogs: (raw.recent_logs ?? []).map((log) => {
      const dt = new Date(log.time)
      const pad = (n: number) => String(n).padStart(2, '0')
      const LEVEL_MAP: Record<string, 'INFO' | 'WARN' | 'ERROR'> = {
        info: 'INFO', warn: 'WARN', error: 'ERROR',
      }
      return {
        date: dt.toISOString().slice(0, 10),
        time: `${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`,
        level: LEVEL_MAP[log.level] ?? 'INFO',
        message: log.message,
      }
    }),
    logsTotalCount: raw.logs_total_count ?? 0,
  }
}

// ── API functions ───────────────────────────────────────────────────

export interface DashboardFetchParams {
  logs_date?: string
  logs_level?: string
  logs_page?: number
  logs_per_page?: number
  cost_model?: string
  cost_date?: string
}

export async function fetchDashboard(params?: DashboardFetchParams): Promise<DashboardResponse> {
  const { data } = await http.get<BackendDashboardSummary>(
    '/api/admin/dashboard/summary',
    { params },
  )
  return mapRawToDashboard(data)
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const { data } = await http.get<AdminUser[]>('/api/admin/users')
  return data
}

export async function blockUser(userId: number) {
  return http.post(`/api/admin/users/${userId}/block`)
}

export async function unblockUser(userId: number) {
  return http.post(`/api/admin/users/${userId}/unblock`)
}

export async function deleteUser(userId: number) {
  return http.delete(`/api/admin/users/${userId}`)
}

export async function changeUserRole(userId: number, role: number) {
  return http.patch(`/api/admin/users/${userId}/role`, { role })
}
