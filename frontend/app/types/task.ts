export interface Task {
  id: string
  user_id?: string
  title: string
  is_completed: boolean
  created_at: string
  updated_at?: string
}

export interface TaskResponse {
  status: string
  message: string
  data: Task
}

export interface TaskListResponse {
  status: string
  message: string
  data: Task[]
}
