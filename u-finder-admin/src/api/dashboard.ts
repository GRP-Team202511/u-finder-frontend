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
}

const API_BASE_URL =
  import.meta.env.VITE_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8080'

interface BackendDashboardSummary {
  total_users: number
  total_users_delta_week?: number | null
  llm_cost_today: {
    amount: number
    budget_per_day?: number | null
  }
  recent_users: Array<{
    id: number
    name: string
    email: string
    type: string
    status: string
    created_at: string
  }>
  recent_logs: Array<{
    time: string
    level: string
    message: string
  }>
  model_cost_snapshot: {
    total_requests: number
    avg_latency_seconds?: number | null
    tokens_total: number
    estimated_cost: {
      amount: number
    }
  }
}

function toTitleCase(value: string): string {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

function mapUserType(type: string): string {
  if (type === '1') return 'Student'
  if (type === '2') return 'Institution'
  if (type === '3') return 'Admin'
  if (type === '4') return 'Consultant'
  return type
}

function mapDashboardResponse(data: BackendDashboardSummary): DashboardResponse {
  const now = Date.now()

  return {
    summary: {
      totalUsers: data.total_users,
      totalUsersSubtitle: `+${data.total_users_delta_week ?? 0} this week`,
      llmCostToday: data.llm_cost_today?.amount ?? 0,
      llmCostSubtitle:
        data.llm_cost_today?.budget_per_day != null
          ? `Budget/day $${data.llm_cost_today.budget_per_day.toFixed(2)}`
          : 'No daily budget configured'
    },
    recentUsers: (data.recent_users ?? []).map((user) => {
      const createdAtMs = Number.isNaN(Date.parse(user.created_at))
        ? now
        : Date.parse(user.created_at)
      const minutes = Math.max(0, Math.floor((now - createdAtMs) / 60000))

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: mapUserType(user.type),
        status: toTitleCase(user.status),
        lastActive: new Date(createdAtMs).toLocaleString(),
        lastActiveMinutes: minutes
      }
    }),
    modelCost: {
      selectedModel: 'chat',
      selectedRange: 'last_24h',
      totalRequests: data.model_cost_snapshot?.total_requests ?? 0,
      avgLatency:
        data.model_cost_snapshot?.avg_latency_seconds != null
          ? `${(data.model_cost_snapshot.avg_latency_seconds * 1000).toFixed(0)} ms`
          : 'N/A',
      estimatedCost: data.model_cost_snapshot?.estimated_cost?.amount ?? 0,
      tokens: String(data.model_cost_snapshot?.tokens_total ?? 0)
    },
    systemLogs: (data.recent_logs ?? []).map((log) => {
      const timestamp = new Date(log.time)

      return {
        date: timestamp.toLocaleDateString(),
        time: timestamp.toLocaleTimeString(),
        level: (log.level || 'info').toUpperCase() as 'INFO' | 'WARN' | 'ERROR',
        message: log.message
      }
    })
  }
}

function getFallbackDashboard(reason: string): DashboardResponse {
  return {
    summary: {
      totalUsers: 0,
      totalUsersSubtitle: `Preview mode (${reason})`,
      llmCostToday: 0,
      llmCostSubtitle: 'Using fallback data for dashboard UI preview'
    },
    recentUsers: [],
    modelCost: {
      selectedModel: 'chat',
      selectedRange: 'last_24h',
      totalRequests: 0,
      avgLatency: 'N/A',
      estimatedCost: 0,
      tokens: '0'
    },
    systemLogs: []
  }
}

export async function fetchDashboard(): Promise<DashboardResponse> {
  const token = localStorage.getItem('admin_token') || ''

  const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/summary`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  })

  if (response.ok) {
    const data = (await response.json()) as BackendDashboardSummary
    return mapDashboardResponse(data)
  }

  if ([401, 403, 404, 422].includes(response.status)) {
    return getFallbackDashboard(`HTTP ${response.status}`)
  }

  const errorBody = await response.text()
  throw new Error(`Failed to fetch dashboard: ${response.status} ${errorBody}`)
}