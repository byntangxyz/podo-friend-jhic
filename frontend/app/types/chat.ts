export type MessageSender = 'user' | 'ai'

export interface ChatMessage {
  id?: number | string
  sender: MessageSender
  message: string
  created_at?: string
}

export interface ChatSession {
  id: string | number
  title?: string
  created_at?: string
  updated_at?: string
  messages_count?: number
  last_message?: string
}

export interface ChatSessionsResponse {
  success?: boolean | string
  message?: string
  data: ChatSession[]
}

export interface CreateSessionResponse {
  success?: boolean | string
  message?: string
  data: ChatSession
}

export interface SessionMessagesResponse {
  success?: boolean | string
  message?: string
  data: ChatMessage[]
}

export interface SendMessagePayload {
  sender: MessageSender
  message: string
}

export interface SendMessageResponse {
  success?: boolean | string
  message?: string
  data: ChatMessage
}

