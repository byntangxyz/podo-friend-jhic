/**
 * Bank Kosakata Bahasa Indonesia untuk Deteksi Emosi & Validasi Perasaan Pengguna
 * Digunakan oleh Podo untuk membaca perasaan riil pengguna dari kata-kata yang diketik,
 * lalu mencocokkannya dengan status Mood UI sebagai validator emosional.
 */

export interface VocabularyItem {
  label: string
  moodKey: string | null
  keywords: string[]
  vibe: string
}

export type VocabularyBankType = Record<string, VocabularyItem>

export const VOCABULARY_BANK: VocabularyBankType = {
  energetic: {
    label: 'Bersemangat / Siap Lanjut',
    moodKey: 'Energetic',
    keywords: [
      'semangat', 'gas', 'gaspol', 'gaskeun', 'siap', 'on fire', 'ambis',
      'ngebut', 'fokus', 'yakin', 'produktif', 'mantap', 'bisa', 'kelar',
      'tuntas', 'ayo', 'ayok', 'seru', 'tantangan', 'beres', 'hajar', 'pasti bisa',
      'udah rehat', 'sudah rehat', 'udah selesai rehat', 'selesai rehat',
      'udah istirahat', 'sudah istirahat', 'selesai istirahat',
      'udah enakan', 'udah mendingan', 'udah seger', 'siap lanjut',
      'lanjut belajar', 'lanjut ngerjain', 'lanjut tugas', 'lanjut lagi', 'mau lanjut',
    ],
    vibe: 'Tinggi energi atau baru selesai istirahat dan siap aksi, butuh partner yang antusias dan langsung mengajak fokus.',
  },

  overwhelmed: {
    label: 'Kewalahan / Terbebani / Panik',
    moodKey: 'Overwhelmed',
    keywords: [
      'pusing', 'mumet', 'numpuk', 'banyak banget', 'mepet', 'deadline',
      'panik', 'bingung', 'stres', 'stress', 'overwhelmed', 'kacau', 'gila',
      'gak keburu', 'gimana nih', 'keblinger', 'beban', 'berat', 'buntu',
      'meledak', 'takut gak selesai', 'nangis', 'pusing pala', 'mau nangis',
    ],
    vibe: 'Kognitif overload, panik, butuh de-eskalasi segera, jangan dijejali saran panjang, perkecil tugas jadi 1 hal mikro.',
  },

  tired: {
    label: 'Lelah / Lemas / Habis Energi',
    moodKey: 'Tired',
    keywords: [
      'capek', 'cape', 'lelah', 'ngantuk', 'loyo', 'lemes', 'lesu',
      'berat mataku', 'drop', 'butuh tidur', 'pegel', 'remuk', 'kehabisan energi',
      'low bat', 'lowbat', 'habis batre', 'pengen rebahan', 'mager', 'letih',
      'tumbang', 'gak kuat', 'istirahat', 'rebahan', 'tepar',
    ],
    vibe: 'Baterai habis, butuh kelembutan tanpa rasa bersalah (anti-guilt), dukung jeda santai/minum/stretching.',
  },

  distracted: {
    label: 'Terganggu / Distraksi / Prokrastinasi',
    moodKey: 'Distracted',
    keywords: [
      'scrolling', 'scroll', 'tiktok', 'ig', 'instagram', 'youtube', 'medsos',
      'buka hp', 'tergoda', 'buyar', 'gagal fokus', 'ngelamun', 'kepecah',
      'kegoda', 'bising', 'ribut', 'berisik', 'males mulai', 'nunda', 'prokrastinasi',
      'kepikiran yang lain', 'gabut', 'melamun', 'hilang fokus', 'gak konsen',
    ],
    vibe: 'Perhatian buyar oleh lingkungan atau gadget, butuh jangkar fokus 1 hal saja dan trik minim distraksi.',
  },

  balanced: {
    label: 'Tenang / Seimbang / Stabil',
    moodKey: 'Balanced',
    keywords: [
      'santai', 'biasa aja', 'tenang', 'adem', 'aman', 'pelan-pelan',
      'stabil', 'ok', 'oke', 'sip', 'normal', 'rileks', 'cukup baik', 'fine',
    ],
    vibe: 'Ritme teratur, pikiran tenang, siap melanjutkan alur kerja yang berkelanjutan.',
  },

  greeting: {
    label: 'Sapaan / Pembuka',
    moodKey: null,
    keywords: [
      'halo', 'hai', 'hi', 'hei', 'hey', 'pagi', 'siang', 'sore', 'malam',
      'p', 'tes', 'oy', 'halo podo', 'hai podo', 'assalamualaikum', 'halo teman',
    ],
    vibe: 'Hanya menyapa, belum mengutarakan beban atau kondisi tugas. Cukup sambut hangat tanpa asumsi stres.',
  },
}

export interface EmotionAnalysisResult {
  type: 'greeting' | 'ui_default' | 'emotion_detected'
  detectedEmotion: string
  detectedLabel: string
  matchedKeywords: string[]
  validationStatus: 'neutral_greeting' | 'ui_default' | 'validated' | 'override_positive' | 'evolved_feeling'
  realFeelingSummary: string
  aiGuidance: string
}

/**
 * Analisis teks pesan pengguna berdasarkan bank kosakata emosi
 * dan lakukan cross-validation dengan status Mood UI saat ini.
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
      if (kw.includes(' ')) {
        if (cleanText.includes(kw)) {
          scores[category] += 2
          matchedWords[category]!.push(kw)
        }
      } else {
        if (normalizedWords.includes(kw)) {
          scores[category] += 1
          matchedWords[category]!.push(kw)
        }
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
  if (!topCategory || maxScore === 0) {
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

  const detectedData = VOCABULARY_BANK[topCategory]!
  const detectedMoodKey = detectedData.moodKey
  const isMatchWithUi =
    Boolean(detectedMoodKey && detectedMoodKey.toLowerCase() === (currentUiMood || '').toLowerCase())

  let validationStatus: 'validated' | 'override_positive' | 'evolved_feeling' = 'validated'
  let guidance = ''

  if (isMatchWithUi) {
    validationStatus = 'validated'
    guidance = `Kosakata pengguna (${matchedWords[topCategory]!.join(', ')}) MEMVALIDASI status UI (${currentUiMood}). Pengguna benar-benar sedang ${detectedData.label.toLowerCase()}. Berikan empati yang tulus sesuai nada mood ini.`
  } else {
    const isNegativeUi = ['Tired', 'Overwhelmed', 'Distracted'].includes(currentUiMood || '')
    const isPositiveText = topCategory === 'energetic'

    if (isNegativeUi && isPositiveText) {
      validationStatus = 'override_positive'
      guidance = `KONTRADIKSI POSITIF: Status UI menunjukkan ${currentUiMood}, tapi kata-kata pengguna (${matchedWords[topCategory]!.join(', ')}) justru penuh semangat! PRIORITASKAN kata-kata pengguna: dukung semangatnya dan langsung ajak mulai sesi fokus.`
    } else {
      validationStatus = 'evolved_feeling'
      guidance = `PERUBAHAN EMOSI: Di UI tercatat ${currentUiMood || 'Normal'}, namun kosakata pengguna (${matchedWords[topCategory]!.join(', ')}) mengindikasikan ia sedang ${detectedData.label.toLowerCase()}. Tanggapi perasaan aktual ini secara fleksibel tanpa kaku terpatok pada status UI.`
    }
  }

  return {
    type: 'emotion_detected',
    detectedEmotion: topCategory,
    detectedLabel: detectedData.label,
    matchedKeywords: matchedWords[topCategory] || [],
    validationStatus,
    realFeelingSummary: `Terdeteksi emosi ${detectedData.label} dari kosakata: [${matchedWords[topCategory]!.join(', ')}]`,
    aiGuidance: guidance,
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
} {
  if (!todayMood) {
    const fallback = VOCABULARY_BANK.balanced!
    return {
      label: fallback.label,
      keywords: fallback.keywords.slice(0, 8).join(', '),
      vibe: fallback.vibe,
      category: 'balanced',
    }
  }

  const query = todayMood.toLowerCase().trim()

  // 1. Cari berdasarkan moodKey (e.g. "Tired", "Energetic")
  for (const [cat, item] of Object.entries(VOCABULARY_BANK)) {
    if (item.moodKey && item.moodKey.toLowerCase() === query) {
      return {
        label: item.label,
        keywords: item.keywords.slice(0, 10).join(', '),
        vibe: item.vibe,
        category: cat,
      }
    }
  }

  // 2. Cari berdasarkan nama kategori langsung (e.g. "tired", "energetic")
  if (VOCABULARY_BANK[query]) {
    const item = VOCABULARY_BANK[query]!
    return {
      label: item.label,
      keywords: item.keywords.slice(0, 10).join(', '),
      vibe: item.vibe,
      category: query,
    }
  }

  // 3. Fallback jika tidak ditemukan
  const fallback = VOCABULARY_BANK.balanced!
  return {
    label: `${todayMood} (Seimbang)`,
    keywords: fallback.keywords.slice(0, 8).join(', '),
    vibe: fallback.vibe,
    category: 'balanced',
  }
}
