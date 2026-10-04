import { useAuthStore } from '~/stores/auth'
import { useSurveyStore } from '~/stores/survey'
import { usePreferencesStore } from '~/stores/preferences'
import { useChatStore } from '~/stores/chat'

export function useAiChat() {
  const authStore = useAuthStore()
  const surveyStore = useSurveyStore()
  const preferencesStore = usePreferencesStore()
  const chatStore = useChatStore()

  /**
   * Alur Pengiriman Pesan Streaming (Nuxt 4 Nitro Server & Vocabulary Bank):
   * 1. Cek Sesi: Jika activeSessionId null, jalankan createSession() terlebih dahulu.
   * 2. Simpan User: Tampilkan ke UI lokal dan simpan ke backend Laravel via POST /api/chat-sessions/{id}/messages.
   * 3. Loading & Placeholder AI: Set isLoading = true dan buat objek pesan AI kosong ("") di state lokal.
   * 4. Fetch Stream: Lakukan request ke server Nitro Nuxt (/api/ai/chat) menggunakan Web Fetch API.
   * 5. Read Stream: Baca chunk demi chunk menggunakan reader.read() dan append ke teks pesan AI lokal secara real-time.
   * 6. Sinkronisasi AI ke Laravel: Setelah stream selesai (done: true), simpan teks final ke backend Laravel.
   * 7. Selesai: Set isLoading = false.
   */
  const sendMessage = async (userText: string): Promise<void> => {
    const trimmed = userText.trim()
    if (!trimmed || chatStore.isLoading) return

    // 1. Cek Sesi
    if (!chatStore.activeSessionId) {
      const newSessionId = await chatStore.createSession()
      if (!newSessionId) {
        console.warn('Could not establish active session ID, continuing with local session')
      }
    }

    // 2. Simpan User: Tampilkan langsung di UI dan simpan ke backend Laravel
    chatStore.addUserMessage(trimmed)
    await chatStore.saveMessage('user', trimmed)

    // 3. Loading & Objek Pesan AI Kosong
    chatStore.setLoading(true)
    const aiMsg = chatStore.addAiMessage('')

    try {
      // Siapkan payload riwayat percakapan untuk server Nitro
      const messagesHistory = chatStore.messages
        .filter((m) => m.id !== aiMsg.id)
        .map((m) => ({
          sender: m.sender,
          message: m.message,
        }))

      const payload = {
        messages: messagesHistory,
        todayMood: surveyStore.todaySurvey?.mood || null,
        chatbotPersonality:
          (authStore.user as any)?.chatbot_personality ||
          preferencesStore.activePersonality ||
          'Empatik & Mendukung',
        userName: authStore.user?.name || 'Kawan',
      }

      // 4. Request ke Nuxt 4 Nitro Server Route (/api/ai/chat)
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`)
      }

      // 5. Konsumsi stream secara asinkron
      const reader = response.body?.getReader()
      const decoder = new TextDecoder('utf-8')
      let fullAiText = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          fullAiText += chunk
          aiMsg.message = fullAiText
          chatStore.updateAiMessage(aiMsg.id, fullAiText)
        }
      } else {
        // Fallback jika browser reader tidak tersedia
        fullAiText = await response.text()
        aiMsg.message = fullAiText
        chatStore.updateAiMessage(aiMsg.id, fullAiText)
      }

      // 6. Sinkronisasi respons AI final ke backend Laravel
      if (fullAiText.trim()) {
        await chatStore.saveMessage('ai', fullAiText)
      }
    } catch (err: any) {
      console.error('[AI Chat Error]:', err)

      // 1. Definisikan pesan error
      const fallbackError =
        aiMsg.message.trim() ||
        err?.message ||
        'Maaf, PodoFriend sedang mengalami gangguan koneksi. Coba lagi ya!'

      // 2. UPDATE STATE LOKAL AGAR UI LANGSUNG BERUBAH (Hapus titik tiga)
      if (aiMsg) {
        aiMsg.message = fallbackError
        chatStore.updateAiMessage(aiMsg.id, fallbackError)
      }

      // 3. Simpan ke database backend
      await chatStore.saveMessage('ai', fallbackError)
    } finally {
      // 4. Matikan status loading global
      chatStore.setLoading(false)
    }
  }

  return {
    sendMessage,
  }
}
