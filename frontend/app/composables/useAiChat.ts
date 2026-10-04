import { ChatOpenAI } from '@langchain/openai'
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
  type BaseMessage,
} from '@langchain/core/messages'
import { useAuthStore } from '~/stores/auth'
import { useSurveyStore } from '~/stores/survey'
import { usePreferencesStore } from '~/stores/preferences'
import { useChatStore } from '~/stores/chat'

export function useAiChat() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  const surveyStore = useSurveyStore()
  const preferencesStore = usePreferencesStore()
  const chatStore = useChatStore()

  /**
   * Menyiapkan instance model LLM via LangChain yang terhubung ke 9Router
   * Kalibrasi: temperature: 0.7 agar respons natural, empatik, dan tidak kaku
   */
  const getModel = () => {
    const baseURL =
      (config.public.aiBaseUrl as string) || 'http://localhost:20128/v1'
    const apiKey =
      (config.public.aiApiKey as string) || '9router-default-key'
    const modelName =
      (config.public.aiModel as string) || 'gpt-4o-mini'

    return new ChatOpenAI({
      model: modelName,
      temperature: 0.7,
      maxTokens: 500,
      configuration: {
        baseURL,
        apiKey,
        dangerouslyAllowBrowser: true,
      },
    })
  }

  /**
   * Membangun System Prompt dinamis berdasarkan data pengguna terkini:
   * "Kamu adalah PodoFriend, AI Companion pencegah burnout. Mood pengguna hari ini adalah [todayMood].
   * Respons pengguna dengan gaya kepribadian yang [chatbot_personality]. Jawab singkat, empatik, dan suportif."
   */
  const buildSystemPrompt = (): string => {
    const userName = authStore.user?.name || 'Kawan'
    const todayMood = surveyStore.todaySurvey?.mood || 'Normal'
    const personality =
      (authStore.user as any)?.chatbot_personality ||
      preferencesStore.activePersonality ||
      'Empatik & Mendukung'

    return `Kamu adalah PodoFriend, AI Companion pencegah burnout. Mood pengguna hari ini adalah ${todayMood}. Respons pengguna dengan gaya kepribadian yang ${personality}. Jawab singkat, empatik, dan suportif.

Pedoman respons:
1. Nama pengguna: ${userName}.
2. Gunakan bahasa Indonesia yang luwes, bersahabat, dan menenangkan.
3. Selalu prioritaskan kesehatan mental dan pencegahan burnout (dukung ritme Pomodoro: 25 menit fokus, 5 menit istirahat).
4. Jangan gunakan emoji grafis atau emotikon visual apa pun di dalam jawaban. Gunakan kata-kata hangat dan terstruktur.`
  }

  /**
   * Menyiapkan balasan fallback jika koneksi ke 9Router / LLM Gateway terkendala
   */
  const getFallbackResponse = (userText: string): string => {
    const userName = authStore.user?.name || 'Kawan'
    const todayMood = surveyStore.todaySurvey?.mood || 'Normal'
    const lower = userText.toLowerCase()

    if (lower.includes('lelah') || lower.includes('capek') || lower.includes('burnout') || lower.includes('stres')) {
      return `Halo ${userName}, Podo mendengar keluh kesahmu. Mengingat mood kamu hari ini adalah ${todayMood}, jangan memaksakan diri ya. Coba tarik napas dalam-dalam, regangkan badan selama 5 menit, dan minum air hangat sebelum kembali belajar.`
    }

    if (lower.includes('fokus') || lower.includes('semangat') || lower.includes('mulai')) {
      return `Bagus sekali ${userName}! Ayo kita mulai sesi Pomodoro 25 menit sekarang. Podo akan mendampingimu agar tetap fokus tanpa merasa terbebani.`
    }

    return `Halo ${userName}! Podo siap mendampingimu belajar. Mood kamu hari ini adalah ${todayMood}. Jangan ragu untuk bercerita atau meminta tips fokus belajar ya!`
  }

  /**
   * Alur Pengiriman Pesan (Wajib Berurutan sesuai spesifikasi):
   * 1. Cek Sesi: Jika activeSessionId null, jalankan createSession() terlebih dahulu.
   * 2. Simpan User: Panggil saveMessage('user', isiPesan) ke backend. Tambahkan pesan ke UI lokal agar langsung muncul.
   * 3. Loading: Set isLoading = true.
   * 4. Generate AI: Lewatkan riwayat pesan (messages) beserta SystemMessage ke fungsi LangChain/9router.
   * 5. Simpan AI: Setelah promise dari LangChain selesai, WAJIB panggil saveMessage('ai', responsAI) ke backend. Tambahkan respons ke UI lokal.
   * 6. Selesai: Set isLoading = false.
   */
  const sendMessage = async (userText: string): Promise<void> => {
    const trimmed = userText.trim()
    if (!trimmed || chatStore.isLoading) return

    // 1. Cek Sesi: Buat sesi baru jika belum ada sesi aktif
    if (!chatStore.activeSessionId) {
      const newSessionId = await chatStore.createSession()
      if (!newSessionId) {
        console.warn('Could not establish active session ID, continuing with local fallback')
      }
    }

    // 2. Simpan User: Tampilkan ke UI lokal secara instan dan simpan ke backend
    chatStore.addUserMessage(trimmed)
    await chatStore.saveMessage('user', trimmed)

    // 3. Loading: Aktifkan indikator berpikir AI
    chatStore.setLoading(true)

    try {
      // 4. Generate AI: Siapkan riwayat pesan & SystemMessage untuk LangChain
      const messagesPayload: BaseMessage[] = [
        new SystemMessage(buildSystemPrompt()),
      ]

      // Ambil hingga 8 pesan percakapan sebelumnya untuk konteks memori
      const recentHistory = chatStore.messages.slice(0, -1).slice(-8)
      for (const m of recentHistory) {
        if (m.sender === 'user') {
          messagesPayload.push(new HumanMessage(m.message))
        } else {
          messagesPayload.push(new AIMessage(m.message))
        }
      }
      // Tambahkan pesan user terkini
      messagesPayload.push(new HumanMessage(trimmed))

      // Panggil model LangChain / 9Router
      let aiText = ''
      try {
        const model = getModel()
        const response = await model.invoke(messagesPayload)
        aiText =
          typeof response.content === 'string'
            ? response.content
            : JSON.stringify(response.content)
      } catch (llmErr) {
        console.warn(
          '[9Router/LangChain] Could not reach AI Gateway. Using empathetic fallback:',
          llmErr
        )
        await new Promise((resolve) => setTimeout(resolve, 600))
        aiText = getFallbackResponse(trimmed)
      }

      // 5. Simpan AI: Simpan balasan AI ke backend agar memori sesi tidak hilang saat di-refresh, lalu masukkan ke UI lokal
      await chatStore.saveMessage('ai', aiText)
      chatStore.addAiMessage(aiText)
    } catch (err: any) {
      console.error('Fatal error during chat processing:', err)
      const fallbackError = 'Maaf, terjadi sedikit kendala saat memproses pesan. Mari coba lagi ya!'
      chatStore.addAiMessage(fallbackError)
      await chatStore.saveMessage('ai', fallbackError)
    } finally {
      // 6. Selesai: Matikan loading
      chatStore.setLoading(false)
    }
  }

  return {
    sendMessage,
    buildSystemPrompt,
  }
}
