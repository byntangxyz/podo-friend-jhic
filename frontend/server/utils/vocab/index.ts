/**
 * Agregator Vocabulary Bank.
 * Untuk menambah kategori emosi baru: buat file `<emosi>.ts` di folder ini,
 * lalu daftarkan di objek VOCABULARY_BANK di bawah.
 */
import type { VocabularyBankType, VocabularyItem } from './types'
import { ENERGETIC_VOCAB } from './energetic'
import { OVERWHELMED_VOCAB } from './overwhelmed'
import { TIRED_VOCAB } from './tired'
import { DISTRACTED_VOCAB } from './distracted'
import { BALANCED_VOCAB } from './balanced'
import { GREETING_VOCAB } from './greeting'

/**
 * Normalisasi sekali saat load: lowercase, trim, buang duplikat.
 * Jadi penulisan keyword di file emosi boleh bebas huruf besar/kecil (mis. "HP", "scroll TikTok").
 */
const normalize = (item: VocabularyItem): VocabularyItem => ({
  ...item,
  keywords: [...new Set(item.keywords.map((k) => k.toLowerCase().trim()).filter(Boolean))],
})

export const VOCABULARY_BANK: VocabularyBankType = {
  energetic: normalize(ENERGETIC_VOCAB),
  overwhelmed: normalize(OVERWHELMED_VOCAB),
  tired: normalize(TIRED_VOCAB),
  distracted: normalize(DISTRACTED_VOCAB),
  balanced: normalize(BALANCED_VOCAB),
  greeting: normalize(GREETING_VOCAB),
}
