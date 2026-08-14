import { describe, expect, it } from 'vitest'
import { mergeCustomVocab, mergeSrs, pullProgress, pushProgress } from './sync'
import type { SrsState, VocabEntry } from '../types'

function state(repetitions: number): SrsState {
  return { repetitions, easeFactor: 2.5, intervalDays: 1, dueAt: 0, seen: repetitions, correct: repetitions }
}

describe('mergeSrs', () => {
  it('keeps the higher repetitions count per word', () => {
    const local = { chat: state(2), chien: state(5) }
    const remote = { chat: state(4), maison: state(1) }
    const merged = mergeSrs(local, remote)
    expect(merged.chat.repetitions).toBe(4)
    expect(merged.chien.repetitions).toBe(5)
    expect(merged.maison.repetitions).toBe(1)
  })
})

describe('mergeCustomVocab', () => {
  it('unions entries by id, local wins on conflict', () => {
    const local: VocabEntry[] = [{ id: 'a', fr: 'a-local', es: 'a', cat: 'sustantivo' }]
    const remote: VocabEntry[] = [
      { id: 'a', fr: 'a-remote', es: 'a', cat: 'sustantivo' },
      { id: 'b', fr: 'b', es: 'b', cat: 'sustantivo' },
    ]
    const merged = mergeCustomVocab(local, remote)
    expect(merged).toHaveLength(2)
    expect(merged.find((e) => e.id === 'a')?.fr).toBe('a-local')
  })
})

describe('when supabase is not configured', () => {
  it('pullProgress resolves to null without throwing', async () => {
    await expect(pullProgress('someone')).resolves.toBeNull()
  })

  it('pushProgress resolves without throwing', async () => {
    await expect(pushProgress('someone', {}, [])).resolves.toBeUndefined()
  })
})
