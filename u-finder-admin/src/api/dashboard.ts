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

function getFallbackDashboard(): DashboardResponse {
  return {
    summary: {
      totalUsers: 0,
      totalUsersSubtitle: 'Dashboard endpoint not available yet',
      llmCostToday: 0,
      llmCostSubtitle: 'Connected to backend health endpoint'
    },
    recentUsers: [],
    modelCost: {
      selectedModel: 'gpt-4o-mini',
      selectedRange: 'today',
      totalRequests: 0,
      avgLatency: '0 ms',
      estimatedCost: 0,
      tokens: '0'
    },
    systemLogs: []
  }
}

export async function fetchDashboard(): Promise<DashboardResponse> {
  const token = localStorage.getItem('admin_token') || ''

  const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  })

  if (response.ok) {
    return response.json()
  }

  if (response.status === 404) {
    const healthResponse = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET'
    })

    if (healthResponse.ok) {
      return getFallbackDashboard()
    }
  }

  throw new Error(`Failed to fetch dashboard: ${response.status}`)
}