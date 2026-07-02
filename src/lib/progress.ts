import type { SrsStore, VocabEntry } from '../types'
import { getState } from './srs'

export function groupMastery(store: SrsStore, entries: VocabEntry[]): number {
  if (entries.length === 0) return 0
  const total = entries.reduce((sum, e) => sum + getState(store, e.id).box, 0)
  const maxTotal = entries.length * 5
  return Math.round((total / maxTotal) * 100)
}
