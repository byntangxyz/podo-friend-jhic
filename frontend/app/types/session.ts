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
  status?: string
  success?: boolean | string
  message: string
  data: PomodoroSession
  meta?: {
    newly_unlocked_achievements?: string[]
  }
}

export interface SessionListResponse {
  status?: string
  success?: boolean | string
  message: string
  data: PomodoroSession[]
}
