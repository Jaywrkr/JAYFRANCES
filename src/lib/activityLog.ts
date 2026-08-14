const STORAGE_KEY = 'jayfrances_activity_log_v1'
const DAY_MS = 24 * 60 * 60 * 1000

export interface DayActivity {
  seen: number
  correct: number
}

export type ActivityLog = Record<string, DayActivity> // fecha YYYY-MM-DD -> actividad

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export function loadActivityLog(): ActivityLog {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ActivityLog) : {}
  } catch {
    return {}
  }
}

function saveActivityLog(log: ActivityLog) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(log))
  } catch {
    // localStorage puede fallar por cuota llena o modo privado
  }
}

export function recordReview(correct: boolean): ActivityLog {
  const log = loadActivityLog()
  const today = todayKey()
  const cur = log[today] ?? { seen: 0, correct: 0 }
  const next: ActivityLog = {
    ...log,
    [today]: { seen: cur.seen + 1, correct: cur.correct + (correct ? 1 : 0) },
  }
  saveActivityLog(next)
  return next
}

function daysAgoKey(n: number): string {
  return new Date(Date.now() - n * DAY_MS).toISOString().slice(0, 10)
}

export interface WeeklyComparison {
  thisWeek: number
  lastWeek: number
}

// Compara palabras repasadas en los últimos 7 días vs. los 7 días anteriores.
export function getWeeklyComparison(log: ActivityLog = loadActivityLog()): WeeklyComparison {
  let thisWeek = 0
  let lastWeek = 0
  for (let i = 0; i < 7; i++) thisWeek += log[daysAgoKey(i)]?.seen ?? 0
  for (let i = 7; i < 14; i++) lastWeek += log[daysAgoKey(i)]?.seen ?? 0
  return { thisWeek, lastWeek }
}
