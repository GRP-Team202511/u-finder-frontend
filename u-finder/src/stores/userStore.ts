import { defineStore } from 'pinia'

// Define the structure of a User object
export interface User {
  id: number
  name: string
  token: string
}

// Create a Pinia store for managing user state
export const useUserStore = defineStore('user', {
  state: () => ({
    // The current user object, or null if no user is logged in
    user: null as User | null,
  }),
  
  getters: {
    // Check if a user is logged in by verifying if the user object is not null
    isLoggedIn: (state) => !!state.user,
  },

  actions: {
    // Set the user object in the store
    setUser(user: User) {
      this.user = user
    },
    // Clear the user object, effectively logging out the user
    logout() {
      this.user = null
    },
  },
  // Enable persistence for the store, so the user state is saved across sessions
  persist: true,
})
