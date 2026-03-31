// This code was completed by GRP Team 2025.11.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

function getToken() {
  return localStorage.getItem('admin_token') || ''
}

function getAuthHeaders() {
  const token = getToken()

  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  }
}

async function parseJsonSafely(res: Response) {
  const text = await res.text()

  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function buildErrorMessage(data: any, fallback: string) {
  if (typeof data === 'string') return data
  if (typeof data?.detail === 'string') return data.detail
  if (Array.isArray(data?.detail)) {
    return data.detail.map((item: any) => item.msg || JSON.stringify(item)).join(', ')
  }
  return fallback
}

export async function adminLogin(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/api/admin/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  })

  const data = await parseJsonSafely(res)

  if (!res.ok) {
    throw new Error(buildErrorMessage(data, 'Admin login failed'))
  }

  return data
}

export async function fetchAdminUsers() {
  const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })

  const data = await parseJsonSafely(res)

  if (!res.ok) {
    throw new Error(buildErrorMessage(data, 'Failed to fetch users'))
  }

  return data
}

export async function fetchDashboardSummary() {
  const res = await fetch(`${API_BASE_URL}/api/admin/dashboard/summary`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })

  const data = await parseJsonSafely(res)

  if (!res.ok) {
    throw new Error(buildErrorMessage(data, 'Failed to fetch dashboard summary'))
  }

  return data
}

export async function fetchModelCostSummary(model: string, range: string) {
  const res = await fetch(
    `${API_BASE_URL}/api/admin/dashboard/model-cost?model=${encodeURIComponent(model)}&range=${encodeURIComponent(range)}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  )

  const data = await parseJsonSafely(res)

  if (!res.ok) {
    throw new Error(buildErrorMessage(data, 'Failed to fetch model cost summary'))
  }

  return data
}

export async function fetchSystemLogs(date: string, level: string) {
  const res = await fetch(
    `${API_BASE_URL}/api/admin/logs?date=${encodeURIComponent(date)}&level=${encodeURIComponent(level)}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  )

  const data = await parseJsonSafely(res)

  if (!res.ok) {
    throw new Error(buildErrorMessage(data, 'Failed to fetch system logs'))
  }

  return data
}