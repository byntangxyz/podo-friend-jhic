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
   * Membangun System Prompt dinamis berdasarkan data pengguna terkini
   */
  const buildSystemPrompt = (): string => {
    const userName = authStore.user?.name || 'Kawan'
    const todayMood = surveyStore.todaySurvey?.mood || 'Belum diisi (Normal)'
    const personality = preferencesStore.activePersonality

    return `Kamu adalah PodoFriend, AI Companion pintar yang mendampingi sesi belajar dan mencegah burnout (Teknik Pomodoro).
Nama pengguna yang kamu temani adalah: ${userName}.
Kondisi mental dan mood pengguna hari ini: "${todayMood}".
Gaya respon kepribadianmu: "${personality}".

Pedoman penting responmu:
1. Respon dalam bahasa Indonesia yang luwes, bersahabat, empatik, dan suportif.
2. Jawab secara ringkas, to-the-point, dan berikan dorongan positif yang relevan dengan mood pengguna saat ini.
3. Jika pengguna merasa lelah, stres, atau burnout, validasi perasaannya dan tawarkan tips jeda santai atau pernapasan 5 menit.
4. Jika pengguna bersemangat, motivasi mereka untuk fokus pada blok waktu Pomodoro 25 menit.
5. ATURAN MUTLAK: JANGAN PERNAH menyertakan karakter emoji apapun (seperti emotikon visual/simbol grafis) di dalam balasanmu. Gunakan teks murni yang hangat dan terstruktur.`
  }

  /**
   * Menyiapkan balasan fallback jika koneksi ke 9Router belum tersedia
   */
  const getFallbackResponse = (userText: string): string => {
    const userName = authStore.user?.name || 'Kawan'
    const todayMood = surveyStore.todaySurvey?.mood || 'Netral'
    const lower = userText.toLowerCase()

    if (lower.includes('lelah') || lower.includes('capek') || lower.includes('burnout')) {
      return `Halo ${userName}, Podo mendengar keluh kesahmu. Mood kamu hari ini tercatat "${todayMood}". Jangan memaksakan diri ya. Coba istirahat sejenak selama 5 menit, regangkan badan, dan minum air putih sebelum lanjut fokus.`
    }

    if (lower.includes('fokus') || lower.includes('semangat') || lower.includes('mulai')) {
      return `Bagus sekali ${userName}! Ayo mulai sesi Pomodoro 25 menit sekarang. Podo akan menemanimu sampai bel istirahat berbunyi. Singkirkan distraksi dan fokus pada satu target dulu ya!`
    }

    return `Halo ${userName}! Podo ada di sini untuk menemanimu belajar. Kondisi mood kamu hari ini adalah "${todayMood}". Mari atur ritme belajar yang sehat agar tidak burnout!`
  }

  /**
   * Mengirim pesan, menjalankan LangChain, dan menyinkronkan ke API backend
   */
  const sendMessage = async (userText: string): Promise<void> => {
    const trimmed = userText.trim()
    if (!trimmed || chatStore.isLoading) return

    // 1. Tambahkan pesan user ke state lokal seketika
    chatStore.addUserMessage(trimmed)

    // 2. Simpan pesan user ke backend secara asinkron (background)
    chatStore.saveMessageToApi('user', trimmed)

    // 3. Aktifkan indikator loading/typing
    chatStore.setLoading(true)

    try {
      // 4. Siapkan riwayat pesan untuk konteks LangChain
      const messagesPayload: BaseMessage[] = [
        new SystemMessage(buildSystemPrompt()),
      ]

      // Ambil hingga 8 pesan terakhir agar konteks tetap terjaga
      const recentHistory = chatStore.messages.slice(-9, -1)
      for (const m of recentHistory) {
        if (m.sender === 'user') {
          messagesPayload.push(new HumanMessage(m.message))
        } else {
          messagesPayload.push(new AIMessage(m.message))
        }
      }
      // Tambahkan pesan terkini
      messagesPayload.push(new HumanMessage(trimmed))

      // 5. Panggil model LLM via LangChain
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
        // Simulasi delay mengetik halus untuk fallback
        await new Promise((resolve) => setTimeout(resolve, 800))
        aiText = getFallbackResponse(trimmed)
      }

      // 6. Tambahkan pesan AI ke state lokal
      chatStore.addAiMessage(aiText)

      // 7. Simpan pesan AI ke backend secara asinkron
      chatStore.saveMessageToApi('ai', aiText)
    } catch (err: any) {
      console.error('Fatal error during chat processing:', err)
      chatStore.addAiMessage(
        'Maaf, terjadi sedikit kendala teknis saat memproses pesan. Mari coba lagi ya!'
      )
    } finally {
      chatStore.setLoading(false)
    }
  }

  return {
    sendMessage,
    buildSystemPrompt,
  }
}
