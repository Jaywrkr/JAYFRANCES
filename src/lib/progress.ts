import type { SrsStore, VocabEntry } from '../types'
import { getState, MASTERED_REPETITIONS } from './srs'

export function groupMastery(store: SrsStore, entries: VocabEntry[]): number {
  if (entries.length === 0) return 0
  const total = entries.reduce(
    (sum, e) => sum + Math.min(getState(store, e.id).repetitions, MASTERED_REPETITIONS),
    0
  )
  const maxTotal = entries.length * MASTERED_REPETITIONS
  return Math.round((total / maxTotal) * 100)
}
