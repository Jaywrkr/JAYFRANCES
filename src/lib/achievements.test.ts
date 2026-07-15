import { describe, expect, it } from 'vitest'
import { getAchievements } from './achievements'
import { reviewCard } from './srs'
import type { VocabEntry } from '../types'

const vocab: VocabEntry[] = [
  { id: 'a', fr: 'a', es: 'a', cat: 'numero' },
  { id: 'b', fr: 'b', es: 'b', cat: 'numero' },
]

const emptyStreak = { lastActiveDate: '', currentStreak: 0, longestStreak: 0 }

describe('achievements', () => {
  it('nothing achieved with no activity', () => {
    const achievements = getAchievements(vocab, {}, emptyStreak, 0)
    expect(achievements.every((a) => !a.achieved)).toBe(true)
  })

  it('unlocks the first-review achievement after one review', () => {
    const srs = reviewCard({}, 'a', true)
    const achievements = getAchievements(vocab, srs, emptyStreak, 0)
    expect(achievements.find((a) => a.id === 'first-review')?.achieved).toBe(true)
  })

  it('unlocks the all-mastered achievement at 100% mastery', () => {
    let srs = {}
    for (const v of vocab) {
      for (let i = 0; i < 5; i++) srs = reviewCard(srs, v.id, true)
    }
    const achievements = getAchievements(vocab, srs, emptyStreak, 0)
    expect(achievements.find((a) => a.id === 'all-mastered')?.achieved).toBe(true)
  })

  it('unlocks streak achievements based on longestStreak', () => {
    const achievements = getAchievements(vocab, {}, { ...emptyStreak, longestStreak: 3 }, 0)
    expect(achievements.find((a) => a.id === 'streak-3')?.achieved).toBe(true)
    expect(achievements.find((a) => a.id === 'streak-7')?.achieved).toBe(false)
  })

  it('unlocks the custom-word achievement when a custom word exists', () => {
    const achievements = getAchievements(vocab, {}, emptyStreak, 1)
    expect(achievements.find((a) => a.id === 'custom-word')?.achieved).toBe(true)
  })
})
