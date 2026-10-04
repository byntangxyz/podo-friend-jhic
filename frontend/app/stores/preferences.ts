import { defineStore } from 'pinia'
import type { UserPreferences, UserPreferencesResponse, UpdatePreferencesPayload } from '~/types/preferences'
import { useAuthStore } from '~/stores/auth'

export interface PersonalityOption {
  id: string
  label: string
  description: string
  icon: string
}

export const PERSONALITY_OPTIONS: PersonalityOption[] = [
  {
    id: 'Empatik & Mendukung',
    label: 'Empatik & Mendukung',
    description: 'Hangat, suportif, peka terhadap kelelahan, dan memberikan validasi positif.',
    icon: 'lucide:heart-handshake',
  },
  {
    id: 'Tegas & Disiplin',
    label: 'Tegas & Disiplin',
    description: 'Fokus pada ketercapaian target, mengingatkan jeda istirahat tepat waktu.',
    icon: 'lucide:target',
  },
  {
    id: 'Santai & Bersahabat',
    label: 'Santai & Bersahabat',
    description: 'Gaya percakapan santai seperti kawan sebaya, rileks dan tidak kaku.',
    icon: 'lucide:coffee',
  },
  {
    id: 'Penyemangat & Energik',
    label: 'Penyemangat & Energik',
    description: 'Penuh antusiasme dan dorongan dinamis untuk memicu semangat belajar.',
    icon: 'lucide:flame',
  },
]

export const usePreferencesStore = defineStore('preferences', {
  state: () => ({
    preferences: null as UserPreferences | null,
    isLoading: false,
    isUpdating: false,
    error: null as string | null,
    personalityOptions: PERSONALITY_OPTIONS,
  }),

  getters: {
    activePersonality: (state): string => {
      return state.preferences?.chatbot_personality || 'Empatik & Mendukung'
    },
    activePersonalityInfo: (state): PersonalityOption => {
      const active = state.preferences?.chatbot_personality || 'Empatik & Mendukung'
      return (
        state.personalityOptions.find((p) => p.id === active) ||
        PERSONALITY_OPTIONS[0]!
      )
    },
  },

  actions: {
    async fetchPreferences() {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return

      this.isLoading = true
      this.error = null
      try {
        const res = await useApiFetch<UserPreferencesResponse>('/api/user/preferences', {
          method: 'GET',
        })
        if (res.data) {
          this.preferences = res.data
        }
      } catch (err: any) {
        console.warn('Failed to load user preferences:', err)
        // Set default jika backend belum memiliki record preferensi
        if (!this.preferences) {
          this.preferences = {
            chatbot_personality: 'Empatik & Mendukung',
          }
        }
      } finally {
        this.isLoading = false
      }
    },

    async updatePersonality(personality: string): Promise<boolean> {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return false

      this.isUpdating = true
      this.error = null
      try {
        const payload: UpdatePreferencesPayload = { chatbot_personality: personality }
        const res = await useApiFetch<UserPreferencesResponse>('/api/user/preferences', {
          method: 'PUT',
          body: payload,
        })
        if (res.data) {
          this.preferences = res.data
        } else if (this.preferences) {
          this.preferences.chatbot_personality = personality
        } else {
          this.preferences = { chatbot_personality: personality }
        }
        return true
      } catch (err: any) {
        console.error('Failed to update personality preference:', err)
        this.error = err.message || 'Gagal menyimpan preferensi kepribadian'
        return false
      } finally {
        this.isUpdating = false
      }
    },
  },

  persist: true,
})
