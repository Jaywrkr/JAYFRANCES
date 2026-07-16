import { describe, expect, it } from 'vitest'
import { getWeakSpots } from './weakSpots'
import { reviewCard } from './srs'
import type { VocabEntry } from '../types'

const vocab: VocabEntry[] = [
  { id: 'a', fr: 'a', es: 'a', cat: 'numero' },
  { id: 'b', fr: 'b', es: 'b', cat: 'numero' },
  { id: 'c', fr: 'c', es: 'c', cat: 'numero' },
]

describe('getWeakSpots', () => {
  it('ignores words with fewer than 2 attempts', () => {
    const srs = reviewCard({}, 'a', false)
    expect(getWeakSpots(vocab, srs)).toEqual([])
  })

  it('ranks lower accuracy first', () => {
    let srs = reviewCard({}, 'a', true)
    srs = reviewCard(srs, 'a', true) // a: 2/2 = 100%
    srs = reviewCard(srs, 'b', false)
    srs = reviewCard(srs, 'b', false) // b: 0/2 = 0%
    srs = reviewCard(srs, 'c', true)
    srs = reviewCard(srs, 'c', false) // c: 1/2 = 50%

    const weak = getWeakSpots(vocab, srs)
    expect(weak.map((w) => w.entry.id)).toEqual(['b', 'c', 'a'])
  })

  it('respects the limit', () => {
    let srs = {}
    for (const v of vocab) {
      srs = reviewCard(srs, v.id, false)
      srs = reviewCard(srs, v.id, false)
    }
    expect(getWeakSpots(vocab, srs, 2)).toHaveLength(2)
  })
})
