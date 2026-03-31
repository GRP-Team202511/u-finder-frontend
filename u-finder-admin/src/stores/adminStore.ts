// This code was completed by GRP Team 2025.11.
import { defineStore } from 'pinia'

export interface Admin {
	id: number
	name: string
	email?: string
	token: string
}

function decodeBase64Url(value: string): string {
	const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
	const padding = normalized.length % 4
	const withPadding = padding === 0 ? normalized : normalized + '='.repeat(4 - padding)
	return atob(withPadding)
}

function extractEmailFromToken(token?: string): string | undefined {
	if (!token) return undefined
	const parts = token.split('.')
	if (parts.length < 2) return undefined
	const payloadPart = parts[1]
	if (!payloadPart) return undefined

	try {
		const payloadText = decodeBase64Url(payloadPart)
		const payload = JSON.parse(payloadText) as Record<string, unknown>
		const candidate = payload.email ?? payload.email_address ?? payload.user_email ?? payload.sub
		if (typeof candidate === 'string' && candidate.includes('@')) {
			return candidate
		}
	} catch {
		return undefined
	}

	return undefined
}

export const useAdminStore = defineStore('admin', {
	state: () => ({
		admin: null as Admin | null,
		avatarUrl: '' as string,
	}),

	getters: {
		isLoggedIn: (state) => !!state.admin,
	},

	actions: {
		setAdmin(admin: Admin, fallbackEmail?: string) {
			this.admin = {
				...admin,
				email: admin.email ?? fallbackEmail ?? extractEmailFromToken(admin.token),
			}
		},
		setAvatar(url: string) {
			this.avatarUrl = url
		},
		logout() {
			this.admin = null
			this.avatarUrl = ''
		},
	},

	persist: true,
})
