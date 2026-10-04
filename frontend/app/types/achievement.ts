export interface AchievementDefinition {
  code: string
  title: string
  description: string
  icon: string
  threshold: number
  type: 'session' | 'minutes' | 'streak'
}

export const ACHIEVEMENT_DEFINITIONS: Record<string, AchievementDefinition> = {
  FIRST_SESSION: {
    code: 'FIRST_SESSION',
    title: 'Langkah Awal',
    description: 'Menyelesaikan sesi Pomodoro pertama',
    icon: 'lucide:flame',
    threshold: 1,
    type: 'session',
  },
  FIRST_60_MIN: {
    code: 'FIRST_60_MIN',
    title: '1 Jam Pertama',
    description: 'Total fokus belajar mencapai 60 menit',
    icon: 'lucide:clock',
    threshold: 60,
    type: 'minutes',
  },
  STREAK_2_DAYS: {
    code: 'STREAK_2_DAYS',
    title: 'Konsisten 2 Hari',
    description: 'Fokus belajar 2 hari berturut-turut',
    icon: 'lucide:zap',
    threshold: 2,
    type: 'streak',
  },
  STREAK_3_DAYS: {
    code: 'STREAK_3_DAYS',
    title: 'Konsisten 3 Hari',
    description: 'Fokus belajar 3 hari berturut-turut',
    icon: 'lucide:sparkles',
    threshold: 3,
    type: 'streak',
  },
  STREAK_7_DAYS: {
    code: 'STREAK_7_DAYS',
    title: 'Konsisten Mingguan',
    description: 'Fokus belajar 7 hari berturut-turut',
    icon: 'lucide:trophy',
    threshold: 7,
    type: 'streak',
  },
}

export interface UserAchievement {
  id: string
  achievement_code: string
  unlocked_at: string
}

export interface AchievementsResponse {
  status: string
  message: string
  data: UserAchievement[]
  unlocked_codes: string[]
}

export interface DisplayAchievement extends AchievementDefinition {
  id: string
  unlocked: boolean
  current: number
}
