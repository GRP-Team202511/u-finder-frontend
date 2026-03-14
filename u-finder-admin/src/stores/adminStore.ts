import { defineStore } from 'pinia'

export interface Admin {
	id: number
	name: string
	token: string
}

export const useAdminStore = defineStore('admin', {
	state: () => ({
		admin: null as Admin | null,
	}),

	getters: {
		isLoggedIn: (state) => !!state.admin,
	},

	actions: {
		setAdmin(admin: Admin) {
			this.admin = admin
		},
		logout() {
			this.admin = null
		},
	},

	persist: true,
})
