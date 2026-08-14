import type { VocabEntry } from '../types'
import { buildMultipleChoice, pick, type MCQuestion } from './exercises'

export type DuelMode = 'competitivo' | 'cooperativo'

export const DUEL_ROUNDS = 10
export const DUEL_START_LIVES = 3
export const DUEL_MIN_POOL = 6

export interface DuelQuestion extends MCQuestion {
  playerIndex: 0 | 1
}

export function buildDuelQuestions(pool: VocabEntry[], rounds: number = DUEL_ROUNDS): DuelQuestion[] {
  const chosen = pick(pool, Math.min(rounds, pool.length))
  return chosen.map((entry, i) => ({
    ...buildMultipleChoice(entry, pool, i % 2 === 0 ? 'fr2es' : 'es2fr'),
    playerIndex: (i % 2) as 0 | 1,
  }))
}

export function applyCoopResult(lives: number, correct: boolean): number {
  return correct ? lives : Math.max(0, lives - 1)
}

export function duelWinner(scores: [number, number]): 0 | 1 | 'tie' {
  if (scores[0] === scores[1]) return 'tie'
  return scores[0] > scores[1] ? 0 : 1
}
