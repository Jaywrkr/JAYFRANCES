import { describe, expect, it } from 'vitest'
import { groupMastery } from './progress'
import { reviewCard } from './srs'
import type { VocabEntry } from '../types'

const entries: VocabEntry[] = [
  { id: 'a', fr: 'a', es: 'a', cat: 'numero' },
  { id: 'b', fr: 'b', es: 'b', cat: 'numero' },
]

describe('groupMastery', () => {
  it('returns 0 for an empty group', () => {
    expect(groupMastery({}, [])).toBe(0)
  })

  it('returns 0 when nothing has been reviewed', () => {
    expect(groupMastery({}, entries)).toBe(0)
  })

  it('returns 100 when every card is fully mastered', () => {
    let store = {}
    for (const e of entries) {
      for (let i = 0; i < 5; i++) store = reviewCard(store, e.id, true)
    }
    expect(groupMastery(store, entries)).toBe(100)
  })

  it('returns a partial percentage for partial progress', () => {
    const store = reviewCard({}, 'a', true) // box 1 of 5 -> only entry a
    expect(groupMastery(store, entries)).toBe(10)
  })
})
