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

export type SurpriseEffect = 'vida_extra' | 'punto_extra' | 'doble_punto' | 'accion_divertida'

export interface SurpriseCard {
  id: string
  emoji: string
  title: string
  desc: string
  effect: SurpriseEffect
}

export const SURPRISE_CARDS: SurpriseCard[] = [
  { id: 'vida', emoji: '❤️', title: '¡Vida extra!', desc: 'El equipo recupera 1 vida', effect: 'vida_extra' },
  { id: 'punto', emoji: '⭐️', title: '¡Punto gratis!', desc: 'Suman 1 acierto sin responder nada', effect: 'punto_extra' },
  { id: 'doble', emoji: '✨', title: 'Doble o nada', desc: 'Si aciertan el próximo reto, vale doble', effect: 'doble_punto' },
  { id: 'grito', emoji: '🗣️', title: 'Grito de copilotos', desc: 'Digan juntos en voz alta: "Bonjour !"', effect: 'accion_divertida' },
  { id: 'choca', emoji: '✋', title: 'Choque de manos', desc: 'Choquen los cinco antes de seguir', effect: 'accion_divertida' },
  { id: 'baile', emoji: '💃', title: 'Paso de baile', desc: 'Hagan un mini paso de baile de 3 segundos', effect: 'accion_divertida' },
  { id: 'mimica', emoji: '🎭', title: 'Mímica relámpago', desc: 'Uno actúa la palabra anterior, el otro la adivina', effect: 'accion_divertida' },
]

export function drawSurpriseCard(): SurpriseCard {
  return SURPRISE_CARDS[Math.floor(Math.random() * SURPRISE_CARDS.length)]
}
