export interface UserPreferences {
  id?: number
  user_id?: number
  chatbot_personality: string
  created_at?: string
  updated_at?: string
}

export interface UserPreferencesResponse {
  success: boolean | string
  message: string
  data: UserPreferences
}

export interface UpdatePreferencesPayload {
  chatbot_personality: string
}
