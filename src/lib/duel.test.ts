import { describe, expect, it } from 'vitest'
import { applyCoopResult, buildDuelQuestions, duelWinner } from './duel'
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
