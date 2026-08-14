import { describe, expect, it } from 'vitest'
import {
  applyCoopResult,
  buildDuelQuestions,
  drawSurpriseCard,
  duelWinner,
  FLIGHT_STORIES,
  pickFlightStory,
  storyMilestones,
  SURPRISE_CARDS,
} from './duel'
import type { VocabEntry } from '../types'

function makePool(n: number): VocabEntry[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `mot-${i}`,
    fr: `mot-${i}`,
    es: `palabra-${i}`,
    cat: 'sustantivo' as const,
  }))
}

describe('buildDuelQuestions', () => {
  it('builds one question per word, capped at rounds', () => {
    const questions = buildDuelQuestions(makePool(20), 10)
    expect(questions).toHaveLength(10)
  })

  it('caps at pool size when smaller than rounds', () => {
    const questions = buildDuelQuestions(makePool(4), 10)
    expect(questions).toHaveLength(4)
  })

  it('alternates the turn between the two players', () => {
    const questions = buildDuelQuestions(makePool(10), 10)
    questions.forEach((q, i) => {
      expect(q.playerIndex).toBe(i % 2 === 0 ? 0 : 1)
    })
  })
})

describe('applyCoopResult', () => {
  it('keeps lives unchanged on a correct answer', () => {
    expect(applyCoopResult(3, true)).toBe(3)
  })

  it('subtracts one life on a wrong answer', () => {
    expect(applyCoopResult(3, false)).toBe(2)
  })

  it('never goes below zero', () => {
    expect(applyCoopResult(0, false)).toBe(0)
  })
})

describe('duelWinner', () => {
  it('picks the player with the higher score', () => {
    expect(duelWinner([5, 3])).toBe(0)
    expect(duelWinner([2, 7])).toBe(1)
  })

  it('reports a tie on equal scores', () => {
    expect(duelWinner([4, 4])).toBe('tie')
  })
})

describe('drawSurpriseCard', () => {
  it('always returns a card from the pool', () => {
    for (let i = 0; i < 20; i++) {
      expect(SURPRISE_CARDS).toContainEqual(drawSurpriseCard())
    }
  })
})

describe('pickFlightStory', () => {
  it('always returns a story from the pool', () => {
    for (let i = 0; i < 20; i++) {
      expect(FLIGHT_STORIES).toContainEqual(pickFlightStory())
    }
  })
})

describe('storyMilestones', () => {
  it('always starts at round 0', () => {
    expect(storyMilestones(10)[0]).toBe(0)
    expect(storyMilestones(4)[0]).toBe(0)
  })

  it('returns increasing, unique milestones within range', () => {
    const milestones = storyMilestones(10)
    expect(new Set(milestones).size).toBe(milestones.length)
    milestones.forEach((m) => expect(m).toBeLessThan(10))
  })

  it('collapses to a single milestone for very short games', () => {
    expect(storyMilestones(2)).toEqual([0])
    expect(storyMilestones(1)).toEqual([0])
  })
})
