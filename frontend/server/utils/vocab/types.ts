/**
 * Tipe data bersama untuk seluruh berkas Vocabulary Bank per emosi.
 */

export interface VocabularyItem {
  label: string
  moodKey: string | null
  keywords: string[]
  vibe: string
}

export type VocabularyBankType = Record<string, VocabularyItem>
