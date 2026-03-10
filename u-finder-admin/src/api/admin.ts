const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function getAdminUsers() {
  const res = await fetch(`${API_BASE_URL}/api/admin/users`)

  if (!res.ok) {
    throw new Error('Failed to fetch admin users')
  }

  return res.json()
}