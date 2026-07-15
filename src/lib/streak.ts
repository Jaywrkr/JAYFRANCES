const STORAGE_KEY = 'jayfrances_streak_v1'
const DAY_MS = 24 * 60 * 60 * 1000

export interface StreakData {
  lastActiveDate: string // YYYY-MM-DD
  currentStreak: number
  longestStreak: number
}

const DEFAULT_STREAK: StreakData = { lastActiveDate: '', currentStreak: 0, longestStreak: 0 }

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export function loadStreak(): StreakData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StreakData) : { ...DEFAULT_STREAK }
  } catch {
    return { ...DEFAULT_STREAK }
  }
}

function saveStreak(data: StreakData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // localStorage puede fallar por cuota llena o modo privado
  }
}

// Registra actividad de hoy y actualiza la racha. Es seguro llamarla varias
// veces por día: solo cambia el estado la primera vez que se llama cada día.
export function recordActivityToday(): StreakData {
  const cur = loadStreak()
  const today = todayKey()
  if (cur.lastActiveDate === today) return cur

  const yesterday = new Date(Date.now() - DAY_MS).toISOString().slice(0, 10)
  const currentStreak = cur.lastActiveDate === yesterday ? cur.currentStreak + 1 : 1
  const next: StreakData = {
    lastActiveDate: today,
    currentStreak,
    longestStreak: Math.max(cur.longestStreak, currentStreak),
  }
  saveStreak(next)
  return next
}
