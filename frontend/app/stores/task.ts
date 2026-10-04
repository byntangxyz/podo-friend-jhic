import { defineStore } from 'pinia'
import type { Task, TaskListResponse, TaskResponse } from '~/types/task'
import { useAuthStore } from '~/stores/auth'
import { useTimerStore } from '~/stores/timer'

const GUEST_STORAGE_KEY = 'podofriend_tasks'

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [] as Task[],
    isLoading: false,
    isSubmitting: false,
    error: null as string | null,
  }),

  getters: {
    totalCount: (state): number => state.tasks.length,
    completedCount: (state): number => state.tasks.filter(t => t.is_completed).length,
    pendingCount: (state): number => state.tasks.filter(t => !t.is_completed).length,
    sortedTasks: (state): Task[] => {
      return [...state.tasks].sort((a, b) => {
        if (a.is_completed !== b.is_completed) {
          return a.is_completed ? 1 : -1
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
    },
  },

  actions: {
    syncToGuestStorage() {
      if (import.meta.client) {
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(this.tasks))
      }
    },

    loadFromGuestStorage() {
      if (import.meta.client) {
        try {
          const raw = localStorage.getItem(GUEST_STORAGE_KEY)
          if (raw) {
            const parsed = JSON.parse(raw)
            if (Array.isArray(parsed)) {
              this.tasks = parsed.map((item: any) => ({
                id: String(item.id || Date.now()),
                title: String(item.title || ''),
                is_completed: Boolean(item.is_completed ?? item.completed ?? false),
                created_at: item.created_at || new Date().toISOString(),
                updated_at: item.updated_at || new Date().toISOString(),
              }))
            }
          }
        } catch {
          this.tasks = []
        }
      }
    },

    async fetchTasks() {
      const authStore = useAuthStore()

      if (!authStore.isAuthenticated) {
        this.loadFromGuestStorage()
        return
      }

      this.isLoading = true
      this.error = null
      try {
        const res = await useApiFetch<TaskListResponse>('/api/tasks', {
          method: 'GET',
        })
        if (res?.data && Array.isArray(res.data)) {
          this.tasks = res.data
        }
      } catch (err: any) {
        console.error('Failed to fetch tasks from server:', err)
        this.error = err?.message || 'Gagal memuat daftar tugas'
      } finally {
        this.isLoading = false
      }
    },

    async addTask(title: string): Promise<Task | null> {
      const trimmed = title.trim()
      if (!trimmed) return null

      const authStore = useAuthStore()
      const timerStore = useTimerStore()
      this.isSubmitting = true
      this.error = null

      try {
        if (authStore.isAuthenticated) {
          const res = await useApiFetch<TaskResponse>('/api/tasks', {
            method: 'POST',
            body: { title: trimmed },
          })
          if (res?.data) {
            this.tasks.unshift(res.data)
            if (!timerStore.activeTask || timerStore.activeTask === 'Fokus Mandiri') {
              timerStore.setActiveTask(res.data.title)
            }
            return res.data
          }
        } else {
          // Guest mode
          const newTask: Task = {
            id: `guest_${Date.now()}`,
            title: trimmed,
            is_completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          this.tasks.unshift(newTask)
          this.syncToGuestStorage()
          if (!timerStore.activeTask || timerStore.activeTask === 'Fokus Mandiri') {
            timerStore.setActiveTask(newTask.title)
          }
          return newTask
        }
      } catch (err: any) {
        console.error('Failed to add task:', err)
        this.error = err?.data?.message || err?.message || 'Gagal menambahkan tugas'
      } finally {
        this.isSubmitting = false
      }

      return null
    },

    async toggleTask(id: string) {
      const target = this.tasks.find(t => t.id === id)
      if (!target) return

      const authStore = useAuthStore()
      const previousState = target.is_completed
      target.is_completed = !previousState

      if (!authStore.isAuthenticated) {
        this.syncToGuestStorage()
        return
      }

      try {
        await useApiFetch<TaskResponse>(`/api/tasks/${id}/toggle`, {
          method: 'PUT',
        })
      } catch (err: any) {
        console.error('Failed to toggle task:', err)
        // Rollback optimistic update
        target.is_completed = previousState
        this.error = err?.message || 'Gagal memperbarui status tugas'
      }
    },

    async deleteTask(id: string) {
      const authStore = useAuthStore()
      const timerStore = useTimerStore()
      const index = this.tasks.findIndex(t => t.id === id)
      if (index === -1) return

      const removedTask = this.tasks[index]
      if (!removedTask) return

      this.tasks.splice(index, 1)

      // Adjust active timer task if deleted task was active
      if (timerStore.activeTask === removedTask.title) {
        const remainingFirst = this.tasks.find(t => !t.is_completed) || this.tasks[0]
        timerStore.setActiveTask(remainingFirst ? remainingFirst.title : 'Fokus Mandiri')
      }

      if (!authStore.isAuthenticated) {
        this.syncToGuestStorage()
        return
      }

      try {
        await useApiFetch(`/api/tasks/${id}`, {
          method: 'DELETE',
        })
      } catch (err: any) {
        console.error('Failed to delete task:', err)
        // Rollback
        this.tasks.splice(index, 0, removedTask)
        this.error = err?.message || 'Gagal menghapus tugas'
      }
    },
  },
})
