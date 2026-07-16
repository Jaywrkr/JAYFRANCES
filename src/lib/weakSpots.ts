import { getState } from './srs'
import type { SrsStore, VocabEntry } from '../types'

export interface WeakSpot {
  entry: VocabEntry
  accuracy: number // 0..1
  seen: number
}

const MIN_ATTEMPTS = 2
const DEFAULT_LIMIT = 20

// Palabras con más fallos relativos a intentos: esto es lo que Duolingo no
// te deja ver ni atacar directamente. Requiere al menos MIN_ATTEMPTS intentos
// para no penalizar palabras vistas una sola vez por mala suerte.
export function getWeakSpots(vocab: VocabEntry[], srs: SrsStore, limit = DEFAULT_LIMIT): WeakSpot[] {
  const withHistory: WeakSpot[] = []
  for (const entry of vocab) {
    const state = getState(srs, entry.id)
    if (state.seen < MIN_ATTEMPTS) continue
    withHistory.push({ entry, accuracy: state.correct / state.seen, seen: state.seen })
  }
  return withHistory
    .sort((a, b) => a.accuracy - b.accuracy || b.seen - a.seen)
    .slice(0, limit)
}
