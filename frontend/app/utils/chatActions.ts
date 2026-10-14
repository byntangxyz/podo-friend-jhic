export type ChatActionType = 'CREATE_TASK' | 'SET_STUDY_MODE'

export interface CreateTaskAction {
  type: 'CREATE_TASK'
  title: string
}

export interface SetStudyModeAction {
  type: 'SET_STUDY_MODE'
  mode: 'cepat' | 'normal' | 'lambat'
  reason?: string
}

export type ParsedChatAction = CreateTaskAction | SetStudyModeAction

export interface ParsedChatMessage {
  cleanText: string
  actions: ParsedChatAction[]
  action: ParsedChatAction | null
}

const ACTION_GLOBAL_REGEX = /<!--ACTION:(CREATE_TASK|SET_STUDY_MODE):([\s\S]*?)-->/g

/**
 * Parsing teks pesan AI untuk memisahkan teks obrolan bersih dengan blok aksi UI.
 * Mendukung multiple actions (misal: rekomendasi mode + rekomendasi buat task sekaligus).
 */
export function parseChatAction(rawMessage: string): ParsedChatMessage {
  if (!rawMessage) {
    return { cleanText: '', actions: [], action: null }
  }

  // Bersihkan tag aksi baik yang sudah selesai (-->) maupun yang sedang di-stream ($)
  const cleanText = rawMessage
    .replace(/<!--ACTION:[\s\S]*?(?:-->|$)/g, '')
    .trim()

  const matches = [...rawMessage.matchAll(ACTION_GLOBAL_REGEX)]
  const actions: ParsedChatAction[] = []

  for (const match of matches) {
    const actionType = match[1] as ChatActionType
    const jsonPayload = match[2]?.trim() || '{}'

    try {
      const data = JSON.parse(jsonPayload)
      if (actionType === 'CREATE_TASK' && data.title) {
        actions.push({
          type: 'CREATE_TASK',
          title: String(data.title).trim(),
        })
      } else if (actionType === 'SET_STUDY_MODE' && data.mode) {
        const mode = String(data.mode).toLowerCase()
        if (mode === 'cepat' || mode === 'normal' || mode === 'lambat') {
          actions.push({
            type: 'SET_STUDY_MODE',
            mode,
            reason: data.reason ? String(data.reason).trim() : undefined,
          })
        }
      }
    } catch (err) {
      console.warn('[parseChatAction] Failed to parse action JSON:', jsonPayload, err)
    }
  }

  return {
    cleanText,
    actions,
    action: actions[0] || null,
  }
}
