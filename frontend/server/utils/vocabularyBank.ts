/**
 * Bank Kosakata Bahasa Indonesia untuk Deteksi Emosi & Validasi Perasaan Pengguna
 * Digunakan oleh Podo untuk membaca perasaan riil pengguna dari kata-kata yang diketik,
 * lalu mencocokkannya dengan status Mood UI sebagai validator emosional.
 *
 * Data kosakata per emosi ada di folder `./vocab/`. File ini hanya berisi logika.
 */
import { VOCABULARY_BANK } from './vocab/index'

export type EmotionSource = 'keyword' | 'llm'

export interface EmotionAnalysisResult {
  type: 'greeting' | 'ui_default' | 'emotion_detected' | 'llm_classified'
  detectedEmotion: string
  detectedLabel: string
  matchedKeywords: string[]
  validationStatus: 'neutral_greeting' | 'ui_default' | 'validated' | 'override_positive' | 'evolved_feeling'
  realFeelingSummary: string
  aiGuidance: string
  confidence?: number
}

/** Keyword berisi spasi/tanda baca (mis. "pasti bisa", "menggebu-gebu") dicocokkan sebagai frasa. */
const isPhrase = (kw: string) => /[^a-z0-9]/.test(kw)

/**
 * Bangun hasil analisis + cross-validation terhadap Mood UI.
 * Dipakai bersama oleh fast-path (keyword) dan fallback classifier (LLM).
 */
export function buildEmotionResult(
  category: string,
  currentUiMood: string,
  evidence: string[],
  source: EmotionSource,
  confidence?: number,
): EmotionAnalysisResult {
  const data = VOCABULARY_BANK[category]!
  const uiMood = currentUiMood || 'Balanced'
  const evidenceText = evidence.join(', ')
  const subject = source === 'keyword' ? `Kosakata pengguna (${evidenceText})` : `Makna pesan pengguna (${evidenceText})`
  const isMatchWithUi = Boolean(data.moodKey && data.moodKey.toLowerCase() === uiMood.toLowerCase())

  let validationStatus: 'validated' | 'override_positive' | 'evolved_feeling'
  let guidance: string

  if (isMatchWithUi) {
    validationStatus = 'validated'
    guidance = `${subject} MEMVALIDASI status UI (${uiMood}). Pengguna benar-benar sedang ${data.label.toLowerCase()}. Berikan empati yang tulus sesuai nada mood ini.`
  } else if (['Tired', 'Overwhelmed', 'Distracted'].includes(uiMood) && category === 'energetic') {
    validationStatus = 'override_positive'
    guidance = `KONTRADIKSI POSITIF: Status UI menunjukkan ${uiMood}, tapi ${subject.toLowerCase()} justru penuh semangat! PRIORITASKAN kondisi aktual pengguna: dukung semangatnya dan langsung ajak mulai sesi fokus.`
  } else {
    validationStatus = 'evolved_feeling'
    guidance = `PERUBAHAN EMOSI: Di UI tercatat ${uiMood}, namun ${subject.toLowerCase()} mengindikasikan ia sedang ${data.label.toLowerCase()}. Tanggapi perasaan aktual ini secara fleksibel tanpa kaku terpatok pada status UI.`
  }

  return {
    type: source === 'keyword' ? 'emotion_detected' : 'llm_classified',
    detectedEmotion: category,
    detectedLabel: data.label,
    matchedKeywords: source === 'keyword' ? evidence : [],
    validationStatus,
    realFeelingSummary: `Terdeteksi emosi ${data.label} (${source === 'keyword' ? 'keyword' : 'LLM classifier'}): [${evidenceText}]`,
    aiGuidance: guidance,
    confidence,
  }
}

/**
 * FAST-PATH: Analisis teks pesan pengguna berdasarkan bank kosakata emosi
 * dan lakukan cross-validation dengan status Mood UI saat ini (moodKey, mis. "Tired").
 * Mengembalikan type 'ui_default' jika tidak ada keyword yang cocok.
 */
export function analyzeUserEmotion(text = '', currentUiMood = 'Balanced'): EmotionAnalysisResult {
  const cleanText = (text || '').toLowerCase().trim()
  const normalizedWords = cleanText.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(Boolean)

  const scores: Record<string, number> = {}
  const matchedWords: Record<string, string[]> = {}

  for (const [category, data] of Object.entries(VOCABULARY_BANK)) {
    scores[category] = 0
    matchedWords[category] = []

    for (const kw of data.keywords) {
      const phrase = isPhrase(kw)
      if (phrase ? cleanText.includes(kw) : normalizedWords.includes(kw)) {
        scores[category] += phrase ? 2 : 1
        matchedWords[category]!.push(kw)
      }
    }
  }

  // Cek apakah pesan murni sapaan pendek
  const isGreetingOnly =
    (scores.greeting || 0) > 0 &&
    (normalizedWords.length <= 3 ||
      ((scores.overwhelmed || 0) === 0 &&
        (scores.tired || 0) === 0 &&
        (scores.distracted || 0) === 0 &&
        (scores.energetic || 0) === 0))

  if (isGreetingOnly) {
    return {
      type: 'greeting',
      detectedEmotion: 'greeting',
      detectedLabel: 'Sapaan Ramah',
      matchedKeywords: matchedWords.greeting || [],
      validationStatus: 'neutral_greeting',
      realFeelingSummary: 'Pengguna hanya menyapa atau memulai obrolan.',
      aiGuidance:
        'Balas sapaan dengan ramah dan hangat. Jangan berasumsi pengguna stres dan jangan menyuruh tarik napas/istirahat. Tanyakan tugas atau target apa yang mau dikerjakan bareng.',
    }
  }

  // Cari kategori emosi non-greeting dengan skor tertinggi
  let topCategory: string | null = null
  let maxScore = 0

  for (const [category, score] of Object.entries(scores)) {
    if (category === 'greeting') continue
    if (score > maxScore) {
      maxScore = score
      topCategory = category
    }
  }

  // Jika tidak ada kata kunci emosional yang terdeteksi, gunakan UI Mood sebagai default
  // (chat.post.ts akan mencoba LLM classifier pada kondisi ini)
  if (!topCategory || maxScore === 0) {
    return buildUiDefaultResult(currentUiMood)
  }

  return buildEmotionResult(topCategory, currentUiMood, matchedWords[topCategory] || [], 'keyword')
}

/** Hasil default ketika tidak ada sinyal emosi (keyword maupun classifier). */
export function buildUiDefaultResult(currentUiMood: string): EmotionAnalysisResult {
  const defaultMood = currentUiMood || 'Balanced'
  return {
    type: 'ui_default',
    detectedEmotion: defaultMood.toLowerCase(),
    detectedLabel: `Sesuai Mood UI (${defaultMood})`,
    matchedKeywords: [],
    validationStatus: 'ui_default',
    realFeelingSummary: `Pesan tidak mengandung kosakata emosi spesifik, mengacu pada mood UI: ${defaultMood}.`,
    aiGuidance: `Gunakan nada dan pendekatan sesuai mood ${defaultMood} yang dipilih pengguna di UI.`,
  }
}

/**
 * Mencari konteks mood dari VOCABULARY_BANK dengan fallback aman ke "Balanced" (Netral/Normal)
 */
export function getMoodContext(todayMood: string | null | undefined): {
  label: string
  keywords: string
  vibe: string
  category: string
  moodKey: string
} {
  const toContext = (cat: string, labelOverride?: string, limit = 10) => {
    const item = VOCABULARY_BANK[cat]!
    return {
      label: labelOverride ?? item.label,
      keywords: item.keywords.slice(0, limit).join(', '),
      vibe: item.vibe,
      category: cat,
      moodKey: item.moodKey || 'Balanced',
    }
  }

  if (!todayMood) return toContext('balanced', undefined, 8)

  const query = todayMood.toLowerCase().trim()

  // 1. Cari berdasarkan moodKey (e.g. "Tired", "Energetic")
  for (const [cat, item] of Object.entries(VOCABULARY_BANK)) {
    if (item.moodKey && item.moodKey.toLowerCase() === query) return toContext(cat)
  }

  // 2. Cari berdasarkan nama kategori langsung (e.g. "tired", "energetic")
  if (VOCABULARY_BANK[query]) return toContext(query)

  // 3. Fallback jika tidak ditemukan
  return toContext('balanced', `${todayMood} (Seimbang)`, 8)
}
