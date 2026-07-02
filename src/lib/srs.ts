import type { SrsState, SrsStore } from '../types'

const STORAGE_KEY = 'jayfrances_srs_v1'

// Intervalos tipo Leitner, en minutos, por caja (0 = recién vista / fallada)
const BOX_INTERVAL_MIN = [0, 10, 60 * 8, 60 * 24 * 2, 60 * 24 * 5, 60 * 24 * 12]
const MAX_BOX = BOX_INTERVAL_MIN.length - 1

export function loadSrs(): SrsStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SrsStore) : {}
  } catch {
    return {}
  }
}

export function saveSrs(store: SrsStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function getState(store: SrsStore, id: string): SrsState {
  return store[id] ?? { box: 0, dueAt: 0, seen: 0, correct: 0 }
}

export function reviewCard(store: SrsStore, id: string, correct: boolean): SrsStore {
  const cur = getState(store, id)
  const nextBox = correct ? Math.min(cur.box + 1, MAX_BOX) : 0
  const dueAt = Date.now() + BOX_INTERVAL_MIN[nextBox] * 60_000
  const next: SrsState = {
    box: nextBox,
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

export function masteryLabel(box: number): string {
  if (box === 0) return 'Nuevo'
  if (box <= 2) return 'Aprendiendo'
  if (box <= 4) return 'Repasando'
  return 'Dominado'
}
