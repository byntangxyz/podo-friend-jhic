/**
 * FALLBACK CLASSIFIER (LLM Zero-Shot)
 * Hanya dipanggil ketika fast-path keyword (vocabularyBank) tidak menemukan sinyal emosi.
 * Didesain agar aman: timeout ketat, output divalidasi zod, dan return null jika gagal
 * sehingga chat utama tetap berjalan.
 */
import type { ChatOpenAI } from '@langchain/openai'
import { SystemMessage, HumanMessage } from '@langchain/core/messages'
import { z } from 'zod'
import { VOCABULARY_BANK } from './vocab/index'
import { buildEmotionResult, type EmotionAnalysisResult } from './vocabularyBank'

const EMOTION_CATEGORIES = ['energetic', 'overwhelmed', 'tired', 'distracted', 'balanced'] as const

const ClassifierSchema = z.object({
  emotion: z.enum([...EMOTION_CATEGORIES, 'neutral']),
  confidence: z.coerce.number().min(0).max(1),
  reason: z.string().max(200).default(''),
})

export interface ClassifierOptions {
  timeoutMs?: number
  minConfidence?: number
  minWords?: number
}

/** Ubah konten pesan LangChain (string | array of parts) menjadi teks biasa. */
export function messageContentToText(content: unknown): string {
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content.map((c) => (typeof c === 'string' ? c : (c as { text?: string })?.text || '')).join('')
  }
  return ''
}

/** Gate: classifier hanya layak dipanggil jika fast-path gagal dan pesan cukup bermakna. */
export function shouldUseLlmClassifier(fastPath: EmotionAnalysisResult | null, text: string, minWords = 3): boolean {
  if (!fastPath || fastPath.type !== 'ui_default') return false
  return text.trim().split(/\s+/).filter(Boolean).length >= minWords
}

function buildClassifierPrompt(): string {
  const categories = EMOTION_CATEGORIES.map((key) => {
    const item = VOCABULARY_BANK[key]!
    return `- ${key}: ${item.label}. Ciri: ${item.vibe}`
  }).join('\n')

  return `Kamu adalah classifier emosi untuk pesan mahasiswa/pelajar Indonesia (bahasa baku, gaul, campur Inggris).
Tentukan SATU emosi dominan dari pesan pengguna berdasarkan makna, nada, dan konteks tersirat (termasuk sarkasme).

Kategori:
${categories}
- neutral: Pertanyaan informatif / netral tanpa muatan emosi.

Balas HANYA JSON valid tanpa markdown, format:
{"emotion":"<kategori>","confidence":<0..1>,"reason":"<maks 12 kata, bahasa Indonesia>"}`
}

function extractJson(raw: string): unknown {
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) return null
  try {
    return JSON.parse(match[0])
  } catch {
    return null
  }
}

/**
 * Klasifikasi emosi via LLM. Return null jika: timeout, error, output tidak valid,
 * emosi "neutral", atau confidence di bawah ambang.
 */
export async function classifyEmotionWithLLM(
  model: ChatOpenAI,
  text: string,
  currentUiMood: string,
  options: ClassifierOptions = {},
): Promise<EmotionAnalysisResult | null> {
  const { timeoutMs = 5000, minConfidence = 0.55 } = options

  try {
    const response = await model.invoke(
      [new SystemMessage(buildClassifierPrompt()), new HumanMessage(text.slice(0, 1000))],
      { signal: AbortSignal.timeout(timeoutMs) },
    )

    const parsed = ClassifierSchema.safeParse(extractJson(messageContentToText(response.content)))
    if (!parsed.success) {
      console.warn('[Emotion Classifier] Output tidak valid, fallback ke UI mood')
      return null
    }

    const { emotion, confidence, reason } = parsed.data
    if (emotion === 'neutral' || confidence < minConfidence) return null

    return buildEmotionResult(emotion, currentUiMood, [reason || emotion], 'llm', confidence)
  } catch (err) {
    console.warn('[Emotion Classifier] Gagal/timeout, fallback ke UI mood:', (err as Error)?.message || err)
    return null
  }
}
