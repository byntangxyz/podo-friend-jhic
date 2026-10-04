import { defineStore } from 'pinia'
import type { ChatMessage, ChatHistoryResponse, SendMessagePayload, SendMessageResponse } from '~/types/chat'
import { useAuthStore } from '~/stores/auth'

export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [] as ChatMessage[],
    isLoading: false,
    isFetching: false,
    hasFetchedHistory: false,
    searchQuery: '',
    error: null as string | null,
  }),

  getters: {
    filteredMessages: (state): ChatMessage[] => {
      if (!state.searchQuery.trim()) {
        return state.messages
      }
      const query = state.searchQuery.toLowerCase()
      return state.messages.filter((m) =>
        m.message.toLowerCase().includes(query)
      )
    },
    hasMessages: (state): boolean => state.messages.length > 0,
    recentUserQueries: (state): string[] => {
      // Ambil hingga 5 pesan unik terakhir dari user untuk ditampilkan di riwayat/sidebar
      const userMsgs = state.messages
        .filter((m) => m.sender === 'user')
        .map((m) => m.message)
      const unique = Array.from(new Set(userMsgs))
      return unique.slice(-6).reverse()
    },
  },

  actions: {
    async fetchChatHistory() {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return

      this.isFetching = true
      this.error = null
      try {
        const res = await useApiFetch<ChatHistoryResponse>('/api/chat', {
          method: 'GET',
        })
        if (Array.isArray(res.data)) {
          // Urutkan dari terlama ke terbaru (ascending) sesuai spesifikasi
          this.messages = res.data.map((item) => ({
            id: item.id || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            sender: item.sender,
            message: item.message,
            created_at: item.created_at || new Date().toISOString(),
          }))
        }
        this.hasFetchedHistory = true
      } catch (err: any) {
        console.error('Failed to fetch chat history:', err)
        this.error = err.message || 'Gagal memuat riwayat obrolan'
      } finally {
        this.isFetching = false
      }
    },

    addUserMessage(text: string): ChatMessage {
      const newMsg: ChatMessage = {
        id: `local-user-${Date.now()}`,
        sender: 'user',
        message: text,
        created_at: new Date().toISOString(),
      }
      this.messages.push(newMsg)
      return newMsg
    },

    addAiMessage(text: string): ChatMessage {
      const newMsg: ChatMessage = {
        id: `local-ai-${Date.now()}`,
        sender: 'ai',
        message: text,
        created_at: new Date().toISOString(),
      }
      this.messages.push(newMsg)
      return newMsg
    },

    async saveMessageToApi(sender: 'user' | 'ai', message: string) {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return

      try {
        const payload: SendMessagePayload = { sender, message }
        await useApiFetch<SendMessageResponse>('/api/chat', {
          method: 'POST',
          body: payload,
        })
      } catch (err) {
        // Log sync error di background tanpa memutus obrolan UI pengguna
        console.warn(`[ChatSync] Failed to sync ${sender} message to server:`, err)
      }
    },

    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    setSearchQuery(query: string) {
      this.searchQuery = query
    },

    clearChatLocally() {
      this.messages = []
      this.searchQuery = ''
    },
  },
})
