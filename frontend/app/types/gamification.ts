export interface GamificationStats {
  current_streak: number
  total_focus_time: number // in minutes
  last_active_date: string | null
}

export interface GamificationResponse {
  success: boolean
  message: string
  data: GamificationStats
}
