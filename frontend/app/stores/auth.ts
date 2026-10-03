import { defineStore } from 'pinia'
import type { User } from '~/types/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
  }),

  getters: {
    isAuthenticated: (state): boolean => Boolean(state.token),
  },

  actions: {
    setToken(token: string | null) {
      this.token = token
    },

    setUser(user: User | null) {
      this.user = user
    },

    setAuth(user: User, token: string) {
      this.user = user
      this.token = token
    },

    async logout() {
      if (this.token) {
        try {
          await useApiFetch('/api/auth/logout', {
            method: 'POST',
          })
        } catch {
          // Abaikan kesalahan saat mencabut token jika sudah kedaluwarsa/tidak valid
        }
      }

      this.user = null
      this.token = null
    },
  },

  persist: true,
})
