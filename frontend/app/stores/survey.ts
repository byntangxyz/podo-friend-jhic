import { defineStore } from 'pinia'
import type { DailySurvey, SurveyResponse } from '~/types/survey'
import { useAuthStore } from '~/stores/auth'

export const useSurveyStore = defineStore('survey', {
  state: () => ({
    todaySurvey: null as DailySurvey | null,
    isLoading: false,
    isSubmitting: false,
    hasCheckedToday: false,
    showModal: false,
  }),

  actions: {
    async fetchTodaySurvey() {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return

      this.isLoading = true
      try {
        const res = await useApiFetch<SurveyResponse>('/api/surveys/today', {
          method: 'GET',
        })
        this.todaySurvey = res.data
        this.hasCheckedToday = true

        // Jika belum ada survey hari ini (data === null), paksa tampilkan modal survey
        if (!this.todaySurvey) {
          this.showModal = true
        } else {
          this.showModal = false
        }
      } catch (error) {
        console.error('Failed to fetch today survey:', error)
      } finally {
        this.isLoading = false
      }
    },

    async submitMood(mood: string): Promise<boolean> {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return false

      this.isSubmitting = true
      try {
        const res = await useApiFetch<SurveyResponse>('/api/surveys/mood', {
          method: 'POST',
          body: { mood },
        })
        if (res.data) {
          this.todaySurvey = res.data
          this.showModal = false
          return true
        }
        return false
      } catch (error) {
        console.error('Failed to submit mood survey:', error)
        throw error
      } finally {
        this.isSubmitting = false
      }
    },

    openModal() {
      this.showModal = true
    },

    closeModal() {
      // Hanya tutup jika sudah ada survey tersimpan
      if (this.todaySurvey) {
        this.showModal = false
      }
    },
  },
})
