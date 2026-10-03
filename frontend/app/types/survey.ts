export type MoodType = 'Energetic' | 'Balanced' | 'Tired' | 'Overwhelmed' | 'Distracted'

export interface DailySurvey {
  id: number
  user_id: number
  mood: string
  created_at?: string
  updated_at?: string
}

export interface SurveyResponse {
  success: boolean
  message: string
  data: DailySurvey | null
}
