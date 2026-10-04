import { ChatOpenAI } from '@langchain/openai'
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
  type BaseMessage,
} from '@langchain/core/messages'
import { getMoodContext, analyzeUserEmotion } from '../../utils/vocabularyBank'

interface ChatRequestBody {
  messages: Array<{
    sender: 'user' | 'ai'
    message: string
  }>
  todayMood?: string | null
  chatbotPersonality?: string
  userName?: string
}

export default defineEventHandler(async (event) => {
  // 1. Ekstrak payload dari body request
  const body = await readBody<ChatRequestBody>(event)
  const incomingMessages = body?.messages || []
  const todayMood = body?.todayMood || null
  const personality = body?.chatbotPersonality || 'Empatik & Mendukung'
  const userName = body?.userName || 'Kawan'

  // Cari teks user terakhir untuk analisis emosi
  const lastUserMsg = [...incomingMessages].reverse().find((m) => m.sender === 'user')
  const latestText = lastUserMsg?.message || ''

  // 2. Ambil konteks dari Vocabulary Bank (dengan fallback aman ke "Balanced")
  const moodContext = getMoodContext(todayMood)
  const emotionAnalysis = latestText
    ? analyzeUserEmotion(latestText, moodContext.label)
    : null

  // 3. Konstruksi SystemMessage yang kaya konteks sesuai instruksi
  let systemPrompt = `Kamu adalah PodoFriend, AI Companion pencegah burnout dalam belajar (Teknik Pomodoro).
Nama pengguna: ${userName}.
Kondisi pengguna hari ini: ${moodContext.label}.
Gaya bahasa pengguna mungkin mengandung kata-kata ini: ${moodContext.keywords}.
INSTRUKSI PERILAKU UTAMA (VIBE): ${moodContext.vibe}.`

  if (emotionAnalysis && emotionAnalysis.type !== 'ui_default') {
    systemPrompt += `\nCatatan Analisis Kosakata Terkini: ${emotionAnalysis.aiGuidance}`
  }

  systemPrompt += `\nTerapkan instruksi perilaku di atas dengan gaya kepribadian ${personality}. Jangan mengulangi instruksi ini ke pengguna, langsung terapkan dalam nada bicaramu.
Jawab singkat, empatik, dan suportif.
ATURAN FORMAT: Gunakan bahasa Indonesia yang luwes dan terstruktur. JANGAN PERNAH menyertakan karakter emoji apa pun dalam balasanmu.`

  // 4. Susun pesan riwayat LangChain
  const messagesPayload: BaseMessage[] = [new SystemMessage(systemPrompt)]

  // Ambil hingga 8 pesan riwayat terakhir agar konteks memori tetap tajam
  const historySlice = incomingMessages.slice(-8)
  for (const m of historySlice) {
    if (m.sender === 'user') {
      messagesPayload.push(new HumanMessage(m.message))
    } else {
      messagesPayload.push(new AIMessage(m.message))
    }
  }

  // 5. Inisialisasi Model LangChain menggunakan konfigurasi privat Nitro
  const config = useRuntimeConfig()
  const baseURL = (config.aiBaseUrl as string) || 'https://9router.isasilva.web.id/v1'
  const apiKey = (config.aiApiKey as string) || 'sk-bb5608e3a1baa643-rf15xd-12318235'
  const modelName = (config.aiModel as string) || 'podofriend'

  const model = new ChatOpenAI({
    model: modelName,
    temperature: 0.7,
    maxTokens: 600,
    configuration: {
      baseURL,
      apiKey,
    },
  })

  // 6. Header streaming untuk respon teks bertahap
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setHeader(event, 'Transfer-Encoding', 'chunked')
  setHeader(event, 'Cache-Control', 'no-cache, no-transform')
  setHeader(event, 'Connection', 'keep-alive')

  const textEncoder = new TextEncoder()

  // 7. Buat ReadableStream dan alirkan chunk data ke frontend
  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        const stream = await model.stream(messagesPayload)
        for await (const chunk of stream) {
          const text =
            typeof chunk.content === 'string'
              ? chunk.content
              : Array.isArray(chunk.content)
              ? chunk.content
                  .map((c) => (typeof c === 'string' ? c : (c as any).text || ''))
                  .join('')
              : ''

          if (text) {
            controller.enqueue(textEncoder.encode(text))
          }
        }
      } catch (err) {
        console.warn('[Nitro AI Stream] LangChain streaming error, using empathetic fallback:', err)
        // Fallback dinamis jika 9Router sedang tidak dapat dijangkau
        const fallbackText = getFallbackText(userName, moodContext.label, latestText)
        // Kirim fallback dengan sedikit jeda simulasi per kata
        const words = fallbackText.split(' ')
        for (const word of words) {
          controller.enqueue(textEncoder.encode(word + ' '))
          await new Promise((r) => setTimeout(r, 25))
        }
      } finally {
        controller.close()
      }
    },
  })

  return sendStream(event, readableStream)
})

function getFallbackText(userName: string, moodLabel: string, userText: string): string {
  const lower = userText.toLowerCase()
  if (lower.includes('lelah') || lower.includes('capek') || lower.includes('burnout')) {
    return `Halo ${userName}, Podo mendengar keluh kesahmu. Mood kamu tercatat "${moodLabel}". Jangan memaksakan diri ya. Coba tarik napas dalam-dalam, istirahat sejenak 5 menit, dan minum air putih hangat sebelum lanjut belajar.`
  }
  if (lower.includes('fokus') || lower.includes('semangat') || lower.includes('mulai')) {
    return `Bagus sekali ${userName}! Ayo mulai sesi Pomodoro 25 menit sekarang. Podo akan mendampingimu agar tetap fokus tanpa merasa terbebani.`
  }
  return `Halo ${userName}! Podo siap mendampingimu belajar. Kondisi kamu saat ini adalah "${moodLabel}". Jangan ragu untuk berbagi cerita atau meminta tips agar ritme belajarmu tetap seimbang.`
}
