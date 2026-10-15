import { useAuthStore } from '~/stores/auth'
import { useSurveyStore } from '~/stores/survey'
import { usePreferencesStore } from '~/stores/preferences'
import { useChatStore } from '~/stores/chat'
import { useTimerStore } from '~/stores/timer'
import { useTaskStore } from '~/stores/task'

export function useAiChat() {
  const authStore = useAuthStore()
  const surveyStore = useSurveyStore()
  const preferencesStore = usePreferencesStore()
  const chatStore = useChatStore()
  const timerStore = useTimerStore()
  const taskStore = useTaskStore()

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

    // 1. Cek Sesi: Pastikan activeSessionId selalu terisi
    if (!chatStore.activeSessionId) {
      const newSessionId = await chatStore.createSession()
      if (!newSessionId && !chatStore.activeSessionId) {
        chatStore.activeSessionId = `local-${Date.now()}`
      }
    }

    // 2. Simpan User: Tampilkan langsung di UI secara instan
    chatStore.addUserMessage(trimmed)
    // Sinkronisasi ke backend Laravel secara asinkron tanpa memblokir stream AI
    chatStore.saveMessage('user', trimmed).catch((err) => {
      console.warn('[useAiChat] Background sync user message failed:', err)
    })

    // 3. Loading & Objek Pesan AI Kosong
    chatStore.setLoading(true)
    chatStore.setMascotState('thinking')
    const aiMsg = chatStore.addAiMessage('')

    try {
      // Siapkan payload riwayat percakapan untuk server Nitro
      const messagesHistory = chatStore.messages
        .filter((m) => m.id !== aiMsg.id)
        .map((m) => ({
          sender: m.sender,
          message: m.message,
        }))

      const pendingTaskTitles = taskStore.tasks
        .filter((t) => !t.is_completed)
        .map((t) => t.title.trim())
        .filter(Boolean)

      const payload = {
        messages: messagesHistory,
        todayMood: surveyStore.todaySurvey?.mood || null,
        chatbotPersonality:
          (authStore.user as any)?.chatbot_personality ||
          preferencesStore.activePersonality ||
          'Empatik & Mendukung',
        userName: authStore.user?.name || 'Kawan',
        studyMode: timerStore.studyMode || 'normal',
        activeTask:
          timerStore.activeTask && timerStore.activeTask !== 'Fokus Mandiri'
            ? timerStore.activeTask
            : null,
        userTasks: pendingTaskTitles.length > 0 ? pendingTaskTitles.slice(0, 8) : null,
        taskSummary:
          taskStore.tasks.length > 0
            ? `${taskStore.pendingCount} tugas belum selesai, ${taskStore.completedCount} selesai`
            : null,
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

        // Tentukan animasi maskot berdasarkan konteks percakapan
        const contextText = `${trimmed} ${fullAiText}`.toLowerCase()
        if (
          contextText.includes('burnout') ||
          contextText.includes('pusing') ||
          contextText.includes('stres') ||
          contextText.includes('kewalahan') ||
          contextText.includes('pening')
        ) {
          chatStore.setMascotState('dizzy')
        } else if (
          contextText.includes('lelah') ||
          contextText.includes('ngantuk') ||
          contextText.includes('capek') ||
          contextText.includes('tidur') ||
          contextText.includes('begadang') ||
          contextText.includes('istirahat') ||
          contextText.includes('rehat')
        ) {
          chatStore.setMascotState('sleepy')
        } else if (
          contextText.includes('selesai') ||
          contextText.includes('hebat') ||
          contextText.includes('semangat') ||
          contextText.includes('keren') ||
          contextText.includes('berhasil') ||
          contextText.includes('luar biasa')
        ) {
          chatStore.setMascotState('excited')
        } else {
          chatStore.setMascotState('excited')
        }

        setTimeout(() => {
          chatStore.setMascotState('idle')
        }, 4000)
      } else {
        chatStore.setMascotState('idle')
      }
    } catch (err: any) {
      console.error('[AI Chat Error]:', err)
      chatStore.setMascotState('dizzy') // Podo pusing karena koneksi bermasalah
      setTimeout(() => {
        chatStore.setMascotState('idle')
      }, 4000)

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
