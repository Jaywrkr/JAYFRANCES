import raw from './vocab_raw.json'
import type { VocabEntry } from '../types'

export const VOCAB: VocabEntry[] = (raw as Omit<VocabEntry, 'id'>[]).map((e) => ({
  ...e,
  id: e.fr,
}))

export const VOCAB_BY_ID: Record<string, VocabEntry> = VOCAB.reduce((acc, v) => {
  acc[v.id] = v
  return acc
}, {} as Record<string, VocabEntry>)
