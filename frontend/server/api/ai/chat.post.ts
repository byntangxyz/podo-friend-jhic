import { ChatOpenAI } from '@langchain/openai'
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
  type BaseMessage,
} from '@langchain/core/messages'
import { getMoodContext, analyzeUserEmotion, type EmotionAnalysisResult } from '../../utils/vocabularyBank'
import { messageContentToText } from '../../utils/emotionClassifier'
import {
  buildSystemPrompt,
  buildChatHistory,
} from '../../utils/promptBuilder'

interface ChatRequestBody {
  messages: Array<{
    sender: 'user' | 'ai'
    message: string
  }>
  todayMood?: string | null
  chatbotPersonality?: string
  userName?: string
  studyMode?: string | null
  activeTask?: string | null
  userTasks?: string[] | null
  taskSummary?: string | null
}

export default defineEventHandler(async (event) => {
  // 1. Ekstrak payload dari body request
  const body = await readBody<ChatRequestBody>(event)
  const incomingMessages = body?.messages || []
  const todayMood = body?.todayMood || null
  const personality = body?.chatbotPersonality || 'Empatik & Mendukung'
  const userName = body?.userName || 'Kawan'
  const studyMode = body?.studyMode || null
  const activeTask = body?.activeTask || null
  const userTasks = body?.userTasks || null
  const taskSummary = body?.taskSummary || null

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

  // 2a. EMOTION DETECTION: Menggunakan Vocabulary Bank (2.500 keyword terkurasi)
  // Tidak memanggil LLM classifier terpisah untuk menghemat kuota & mencegah 503/400 gateway 9Router
  const emotionAnalysis: EmotionAnalysisResult | null = latestText
    ? analyzeUserEmotion(latestText, moodContext.moodKey)
    : null

  if (import.meta.dev && emotionAnalysis) {
    console.info(
      `[PodoFriend Emotion] ${emotionAnalysis.type} -> ${emotionAnalysis.detectedEmotion} (${emotionAnalysis.validationStatus})`,
    )
  }

  // 3. Konstruksi SystemMessage yang kaya konteks sesuai modul promptBuilder
  const systemPrompt = buildSystemPrompt({
    userName,
    todayMood,
    moodContext,
    personality,
    studyMode,
    activeTask,
    userTasks,
    taskSummary,
    emotionAnalysis,
  })

  // 4. Susun pesan riwayat LangChain (hingga 12 pesan terakhir untuk sliding window yang tajam)
  const messagesPayload: BaseMessage[] = [
    new SystemMessage(systemPrompt),
    ...buildChatHistory(incomingMessages, 12),
  ]

  // 5. Header streaming untuk respon teks bertahap
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setHeader(event, 'Transfer-Encoding', 'chunked')
  setHeader(event, 'Cache-Control', 'no-cache, no-transform')
  setHeader(event, 'Connection', 'keep-alive')

  const textEncoder = new TextEncoder()

  // 6. Buat ReadableStream dengan Multi-Model Fallback & Auto-Retry
  const readableStream = new ReadableStream({
    async start(controller) {
      // Daftar kandidat model jika podofriend terkena rotasi upstream unavailable / 503
      const candidateModels = [modelName, 'ag/gpt-oss-120b-medium', 'ag/gemini-3.8-flash']
      let streamStarted = false

      for (const currentModel of candidateModels) {
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            const aiClient = new ChatOpenAI({
              model: currentModel,
              temperature: 0.7,
              maxTokens: 600,
              configuration: {
                baseURL,
                apiKey,
              },
            })

            const stream = await aiClient.stream(messagesPayload)
            for await (const chunk of stream) {
              const text = messageContentToText(chunk.content)

              if (text) {
                // Jika model upstream mengembalikan pesan penolakan / error gateway
                if (
                  text.includes('is no longer available') ||
                  text.includes('Model is unavailable') ||
                  text.includes('Service temporarily overloaded')
                ) {
                  throw new Error(`Upstream model error: ${text}`)
                }
                streamStarted = true
                controller.enqueue(textEncoder.encode(text))
              }
            }

            // Jika streaming berhasil sampai akhir, tutup stream dan selesai
            controller.close()
            return
          } catch (err) {
            console.warn(
              `[Nitro AI Stream] Error on ${currentModel} (attempt ${attempt}):`,
              (err as Error)?.message || err,
            )
            // Jika chunk sudah sempat terkirim ke klien, jangan coba model lain agar tidak duplikasi teks
            if (streamStarted) {
              controller.close()
              return
            }
            // Jeda 500ms sebelum retry berikutnya
            await new Promise((r) => setTimeout(r, 500))
          }
        }
      }

      // Jika seluruh model & retry gagal, tampilkan fallback teks ramah
      try {
        console.warn('[Nitro AI Stream] All candidate models exhausted, using empathetic fallback')
        const fallbackText = getFallbackText(userName, moodContext.label, latestText)
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
    return `Podo mendengar keluh kesahmu, ${userName}. Jangan paksakan diri ya. Ambil jeda sejenak 5 menit, tarik napas dalam-dalam, dan minum air putih dulu. Podo selalu ada di sini.`
  }
  if (lower.includes('fokus') || lower.includes('semangat') || lower.includes('mulai')) {
    return `Semangatmu luar biasa, ${userName}! Server AI Podo sedang sedikit padat, tapi kamu bisa langsung mulai sesi timer Pomodoro di dashboard sekarang. Podo tetap mendampingimu!`
  }
  return `Maaf ${userName}, koneksi Podo ke server AI sedang mengalami lonjakan antrean sesaat. Tapi Podo tetap di sini menemani belajarmu. Coba kirim ulang pesanmu dalam beberapa detik ya!`
}
