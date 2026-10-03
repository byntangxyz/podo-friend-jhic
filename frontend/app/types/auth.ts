export interface User {
  id: number
  name: string
  email: string
  email_verified_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface ApiResponse<T = any> {
  success: boolean | string
  message: string
  data: T
}

export interface AuthData {
  user: User
  token: string
}

export type AuthResponse = ApiResponse<AuthData>

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface ApiErrorResponse {
  success?: boolean | string
  message?: string
  data?: any
  errors?: Record<string, string[]>
}
