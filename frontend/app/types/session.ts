export interface PomodoroSession {
  id: string
  user_id: number
  start_time: string
  end_time?: string | null
  duration_minutes?: number | null
  created_at?: string
  updated_at?: string
}

export interface SessionResponse {
  success: boolean
  message: string
  data: PomodoroSession
}
