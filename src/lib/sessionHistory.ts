const STORAGE_KEY = 'jayfrances_session_history_v1'
const MAX_ENTRIES = 200

export interface SessionRecord {
  id: string
  date: string // ISO
  groupId: string
  exerciseType: string
  correct: number
  total: number
}

export function loadSessionHistory(): SessionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SessionRecord[]) : []
  } catch {
    return []
  }
}

function saveSessionHistory(records: SessionRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch {
    // localStorage puede fallar por cuota llena o modo privado
  }
}

export function recordSession(entry: Omit<SessionRecord, 'id' | 'date'>): SessionRecord[] {
  const record: SessionRecord = { ...entry, id: `session:${Date.now()}`, date: new Date().toISOString() }
  const updated = [record, ...loadSessionHistory()].slice(0, MAX_ENTRIES)
  saveSessionHistory(updated)
  return updated
}
