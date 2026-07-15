import type { LegacySrsState, SrsState, SrsStore } from '../types'

const STORAGE_KEY = 'jayfrances_srs_v1'

const DEFAULT_EASE = 2.5
const MIN_EASE = 1.3
const FAIL_RELEARN_MINUTES = 10
const DAY_MS = 24 * 60 * 60 * 1000
export const MASTERED_REPETITIONS = 5

function isLegacyState(s: unknown): s is LegacySrsState {
  return typeof s === 'object' && s !== null && 'box' in s && !('repetitions' in s)
}

// Convierte una entrada del formato Leitner viejo a un estado SM-2 equivalente,
// para no perder el progreso guardado en localStorage de sesiones anteriores.
function migrateLegacy(legacy: LegacySrsState): SrsState {
  const LEGACY_INTERVAL_DAYS = [0, 0, 8 / 24, 2, 5, 12]
  return {
    repetitions: legacy.box,
    easeFactor: DEFAULT_EASE,
    intervalDays: LEGACY_INTERVAL_DAYS[legacy.box] ?? 0,
    dueAt: legacy.dueAt,
    seen: legacy.seen,
    correct: legacy.correct,
  }
}

export function loadSrs(): SrsStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, SrsState | LegacySrsState>
    const migrated: SrsStore = {}
    for (const [id, state] of Object.entries(parsed)) {
      migrated[id] = isLegacyState(state) ? migrateLegacy(state) : (state as SrsState)
    }
    return migrated
  } catch {
    return {}
  }
}

export function saveSrs(store: SrsStore) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // localStorage puede fallar por cuota llena o modo privado; el progreso
    // sigue funcionando en memoria durante la sesión aunque no se persista.
  }
}

export function getState(store: SrsStore, id: string): SrsState {
  return store[id] ?? { repetitions: 0, easeFactor: DEFAULT_EASE, intervalDays: 0, dueAt: 0, seen: 0, correct: 0 }
}

// Algoritmo SM-2 (SuperMemo 2), con calidad binaria: correcto = 4, incorrecto = 2.
export function reviewCard(store: SrsStore, id: string, correct: boolean): SrsStore {
  const cur = getState(store, id)
  const quality = correct ? 4 : 2

  const easeFactor = Math.max(
    MIN_EASE,
    cur.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  )

  let repetitions: number
  let intervalDays: number
  let dueAt: number

  if (!correct) {
    repetitions = 0
    intervalDays = 0
    dueAt = Date.now() + FAIL_RELEARN_MINUTES * 60_000
  } else {
    repetitions = cur.repetitions + 1
    if (repetitions === 1) intervalDays = 1
    else if (repetitions === 2) intervalDays = 6
    else intervalDays = Math.round(cur.intervalDays * easeFactor)
    dueAt = Date.now() + intervalDays * DAY_MS
  }

  const next: SrsState = {
    repetitions,
    easeFactor,
    intervalDays,
    dueAt,
    seen: cur.seen + 1,
    correct: cur.correct + (correct ? 1 : 0),
  }
  const updated = { ...store, [id]: next }
  saveSrs(updated)
  return updated
}

export function isDue(store: SrsStore, id: string): boolean {
  const s = store[id]
  if (!s) return true
  return s.dueAt <= Date.now()
}

export function isMastered(state: SrsState): boolean {
  return state.repetitions >= MASTERED_REPETITIONS
}

export function masteryLabel(repetitions: number): string {
  if (repetitions === 0) return 'Nuevo'
  if (repetitions <= 2) return 'Aprendiendo'
  if (repetitions <= 4) return 'Repasando'
  return 'Dominado'
}
