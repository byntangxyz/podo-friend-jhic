import { ChatOpenAI } from '@langchain/openai'
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
  type BaseMessage,
} from '@langchain/core/messages'
import { getMoodContext, analyzeUserEmotion, type EmotionAnalysisResult } from '../../utils/vocabularyBank'
import {
  classifyEmotionWithLLM,
  shouldUseLlmClassifier,
  messageContentToText,
} from '../../utils/emotionClassifier'

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

  // Konfigurasi model (dipakai classifier & chat utama)
  const config = useRuntimeConfig()
  const baseURL = (config.aiBaseUrl as string) || process.env.NUXT_AI_BASE_URL || ''
  const apiKey = (config.aiApiKey as string) || process.env.NUXT_AI_API_KEY || ''
  const modelName = (config.aiModel as string) || process.env.NUXT_AI_MODEL || 'podofriend'
  const classifierModelName =
    (config.aiClassifierModel as string) || process.env.NUXT_AI_CLASSIFIER_MODEL || modelName

  // 2a. HYBRID EMOTION DETECTION
  //   Tier 1 - Fast-path keyword (0 ms)
  //   Tier 2 - LLM classifier, HANYA jika keyword tidak menemukan sinyal
  //   Tier 3 - Instruksi eksplisit di prompt chat jika classifier juga gagal
  let emotionAnalysis: EmotionAnalysisResult | null = latestText
    ? analyzeUserEmotion(latestText, moodContext.moodKey)
    : null

  if (baseURL && apiKey && shouldUseLlmClassifier(emotionAnalysis, latestText)) {
    const classifierModel = new ChatOpenAI({
      model: classifierModelName,
      temperature: 0,
      maxTokens: 150,
      configuration: { baseURL, apiKey },
    })
    const classified = await classifyEmotionWithLLM(classifierModel, latestText, moodContext.moodKey)
    if (classified) emotionAnalysis = classified
  }

  if (import.meta.dev && emotionAnalysis) {
    console.info(
      `[PodoFriend Emotion] ${emotionAnalysis.type} -> ${emotionAnalysis.detectedEmotion} (${emotionAnalysis.validationStatus})`,
    )
  }

  // 3. Konstruksi SystemMessage yang kaya konteks sesuai instruksi
  let systemPrompt = `Kamu adalah PodoFriend, AI Companion pencegah burnout dalam belajar (Teknik Pomodoro).
Nama pengguna: ${userName}.
Kondisi pengguna hari ini: ${moodContext.label}.
Gaya bahasa pengguna mungkin mengandung kata-kata ini: ${moodContext.keywords}.
INSTRUKSI PERILAKU UTAMA (VIBE): ${moodContext.vibe}.`

  if (emotionAnalysis && emotionAnalysis.type !== 'ui_default') {
    const sourceLabel = emotionAnalysis.type === 'llm_classified' ? 'Analisis Makna Pesan' : 'Analisis Kosakata'
    systemPrompt += `\nCatatan ${sourceLabel} Terkini: ${emotionAnalysis.aiGuidance}`
  } else if (emotionAnalysis) {
    // Tier 3: tidak ada sinyal jelas -> serahkan pembacaan nuansa ke LLM chat secara eksplisit
    systemPrompt += `\nCatatan Analisis: Pesan terakhir tidak mengandung sinyal emosi yang jelas. Baca sendiri nuansa dan nada pesan pengguna. Jika tetap ambigu, ikuti kondisi mood hari ini (${moodContext.moodKey}) dan boleh bertanya singkat tentang perasaannya tanpa terkesan menginterogasi.`
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
          const text = messageContentToText(chunk.content)

          if (text) {
            // Jika model upstream mengembalikan pesan penolakan / deprecated model
            if (text.includes('is no longer available') || text.includes('no longer available')) {
              throw new Error(`Upstream model error: ${text}`)
            }
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
