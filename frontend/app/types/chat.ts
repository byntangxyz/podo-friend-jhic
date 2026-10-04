export type MessageSender = 'user' | 'ai'

export interface ChatMessage {
  id?: number | string
  sender: MessageSender
  message: string
  created_at?: string
}

export interface ChatHistoryResponse {
  success: boolean | string
  message: string
  data: ChatMessage[]
}

export interface SendMessagePayload {
  sender: MessageSender
  message: string
}

export interface SendMessageResponse {
  success: boolean | string
  message: string
  data: ChatMessage
}
