import { defineStore } from 'pinia'
import type {
  ChatMessage,
  ChatSession,
  ChatSessionsResponse,
  CreateSessionResponse,
  SessionMessagesResponse,
  SendMessagePayload,
  SendMessageResponse,
} from '~/types/chat'
import { useAuthStore } from '~/stores/auth'

export const useChatStore = defineStore('chat', {
  state: () => ({
    sessions: [] as ChatSession[],
    activeSessionId: null as string | number | null,
    messages: [] as ChatMessage[],
    isLoading: false,
    isFetchingSessions: false,
    isFetchingMessages: false,
    searchQuery: '',
    error: null as string | null,
  }),

  getters: {
    activeSession: (state): ChatSession | null => {
      if (!state.activeSessionId) return null
      return (
        state.sessions.find(
          (s) => String(s.id) === String(state.activeSessionId)
        ) || null
      )
    },

    filteredSessions: (state): ChatSession[] => {
      if (!state.searchQuery.trim()) {
        return state.sessions
      }
      const query = state.searchQuery.toLowerCase()
      return state.sessions.filter((s) => {
        const titleMatch = s.title?.toLowerCase().includes(query)
        const lastMsgMatch = s.last_message?.toLowerCase().includes(query)
        return Boolean(titleMatch || lastMsgMatch)
      })
    },

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
    hasSessions: (state): boolean => state.sessions.length > 0,
  },

  actions: {
    /**
     * Mengambil daftar riwayat sesi obrolan dari GET /api/chat-sessions
     */
    async fetchSessions() {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return

      this.isFetchingSessions = true
      this.error = null
      try {
        const res = await useApiFetch<ChatSessionsResponse | ChatSession[]>(
          '/api/chat-sessions',
          { method: 'GET' }
        )

        let sessionList: ChatSession[] = []
        if (Array.isArray(res)) {
          sessionList = res
        } else if (res && Array.isArray((res as any).data)) {
          sessionList = (res as any).data
        }

        this.sessions = sessionList
      } catch (err: any) {
        console.error('Failed to fetch chat sessions:', err)
        this.error = err.message || 'Gagal memuat riwayat sesi obrolan'
      } finally {
        this.isFetchingSessions = false
      }
    },

    /**
     * Membuat sesi obrolan baru melalui POST /api/chat-sessions
     */
    async createSession(title?: string): Promise<string | number | null> {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return null

      this.error = null
      try {
        const payload: { title?: string } = {}
        if (title?.trim()) {
          payload.title = title.trim()
        }

        const res = await useApiFetch<CreateSessionResponse | any>(
          '/api/chat-sessions',
          {
            method: 'POST',
            body: Object.keys(payload).length > 0 ? payload : undefined,
          }
        )

        const newSessionData = res?.data || res
        const newSessionId = newSessionData?.id || `session-${Date.now()}`

        const createdSession: ChatSession = {
          id: newSessionId,
          title:
            newSessionData?.title ||
            title ||
            `Obrolan Baru ${new Date().toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
            })}`,
          created_at: newSessionData?.created_at || new Date().toISOString(),
          updated_at: newSessionData?.updated_at || new Date().toISOString(),
          messages_count: 0,
        }

        // Tambahkan sesi baru ke awal list sesi jika belum ada
        const exists = this.sessions.some(
          (s) => String(s.id) === String(newSessionId)
        )
        if (!exists) {
          this.sessions.unshift(createdSession)
        }

        // Set activeSessionId dan kosongkan array messages
        this.activeSessionId = newSessionId
        this.messages = []

        return newSessionId
      } catch (err: any) {
        console.error('Failed to create chat session:', err)
        this.error = err.message || 'Gagal membuat sesi obrolan baru'

        // Fallback offline / local session jika backend sementara bermasalah
        const fallbackId = `local-${Date.now()}`
        const fallbackSession: ChatSession = {
          id: fallbackId,
          title: 'Obrolan Baru',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        this.sessions.unshift(fallbackSession)
        this.activeSessionId = fallbackId
        this.messages = []
        return fallbackId
      }
    },

    /**
     * Mengambil riwayat pesan untuk sesi tertentu dari GET /api/chat-sessions/{sessionId}/messages
     */
    async fetchMessages(sessionId: string | number) {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated || !sessionId) return

      this.activeSessionId = sessionId
      this.isFetchingMessages = true
      this.error = null

      try {
        const res = await useApiFetch<SessionMessagesResponse | ChatMessage[]>(
          `/api/chat-sessions/${sessionId}/messages`,
          { method: 'GET' }
        )

        let msgList: ChatMessage[] = []
        if (Array.isArray(res)) {
          msgList = res
        } else if (res && Array.isArray((res as any).data)) {
          msgList = (res as any).data
        }

        // Pastikan format terstandardisasi (backend mengurutkan ascending)
        this.messages = msgList.map((item) => ({
          id:
            item.id ||
            `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          sender: item.sender,
          message: item.message,
          created_at: item.created_at || new Date().toISOString(),
        }))
      } catch (err: any) {
        console.error(`Failed to fetch messages for session ${sessionId}:`, err)
        this.error = err.message || 'Gagal memuat pesan sesi obrolan'
        this.messages = []
      } finally {
        this.isFetchingMessages = false
      }
    },

    /**
     * Menyimpan pesan ke backend melalui POST /api/chat-sessions/{activeSessionId}/messages
     */
    async saveMessage(
      sender: 'user' | 'ai',
      message: string,
      sessionId?: string | number
    ): Promise<ChatMessage | null> {
      const authStore = useAuthStore()
      const targetSessionId = sessionId || this.activeSessionId
      if (!authStore.isAuthenticated || !targetSessionId) return null

      try {
        const payload: SendMessagePayload = { sender, message }
        const res = await useApiFetch<SendMessageResponse | any>(
          `/api/chat-sessions/${targetSessionId}/messages`,
          {
            method: 'POST',
            body: payload,
          }
        )

        // Perbarui preview pesan terakhir di daftar sesi
        const sessionIndex = this.sessions.findIndex(
          (s) => String(s.id) === String(targetSessionId)
        )
        if (sessionIndex !== -1) {
          const s = this.sessions[sessionIndex]!
          s.last_message = message
          s.updated_at = new Date().toISOString()
          // Pindahkan sesi yang baru aktif ke urutan paling atas
          if (sessionIndex > 0) {
            this.sessions.splice(sessionIndex, 1)
            this.sessions.unshift(s)
          }
        }

        const savedMsg = res?.data || res
        return {
          id: savedMsg?.id || `msg-${Date.now()}`,
          sender: savedMsg?.sender || sender,
          message: savedMsg?.message || message,
          created_at: savedMsg?.created_at || new Date().toISOString(),
        }
      } catch (err) {
        console.warn(
          `[ChatSync] Failed to save ${sender} message to session ${targetSessionId}:`,
          err
        )
        return null
      }
    },

    /**
     * Tambahkan pesan pengguna ke state UI lokal secara instan
     */
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

    /**
     * Tambahkan balasan AI ke state UI lokal secara instan
     */
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

    selectSession(sessionId: string | number) {
      return this.fetchMessages(sessionId)
    },

    clearActiveSession() {
      this.activeSessionId = null
      this.messages = []
    },

    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    setSearchQuery(query: string) {
      this.searchQuery = query
    },
  },
})
