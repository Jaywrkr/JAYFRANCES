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

export interface FlightStory {
  id: string
  emoji: string
  destination: string
  beats: [string, string, string]
  landing: string
  emergency: string
}

export const FLIGHT_STORIES: FlightStory[] = [
  {
    id: 'paris',
    emoji: '🗼',
    destination: 'París',
    beats: [
      '✈️ Despegan rumbo a París. ¡Abróchense los cinturones!',
      '☁️ Sobrevuelan el océano — todavía falta un buen tramo.',
      '🌆 A lo lejos ya se ven las luces de la ciudad.',
    ],
    landing: '🎉 ¡Aterrizaron en París! Misión cumplida.',
    emergency: '😅 Tuvieron que aterrizar de emergencia antes de llegar a París.',
  },
  {
    id: 'tokio',
    emoji: '🗾',
    destination: 'Tokio',
    beats: [
      '✈️ Despegan rumbo a Tokio. ¡A volar!',
      '🌊 Cruzando el océano Pacífico, todo tranquilo por ahora.',
      '🏯 Ya se distinguen las montañas junto a la ciudad.',
    ],
    landing: '🎉 ¡Aterrizaron en Tokio! Misión cumplida.',
    emergency: '😅 Tuvieron que aterrizar de emergencia antes de llegar a Tokio.',
  },
  {
    id: 'nueva-york',
    emoji: '🗽',
    destination: 'Nueva York',
    beats: [
      '✈️ Despegan rumbo a Nueva York.',
      '☁️ Volando sobre las nubes, todo en calma.',
      '🌃 Ya se ve el perfil de los rascacielos.',
    ],
    landing: '🎉 ¡Aterrizaron en Nueva York! Misión cumplida.',
    emergency: '😅 Tuvieron que aterrizar de emergencia antes de llegar a Nueva York.',
  },
  {
    id: 'rio',
    emoji: '🏖️',
    destination: 'Río de Janeiro',
    beats: [
      '✈️ Despegan rumbo a Río de Janeiro.',
      '🌊 Sobrevuelan el mar rumbo a Sudamérica.',
      '⛰️ Ya se asoma el Pan de Azúcar en el horizonte.',
    ],
    landing: '🎉 ¡Aterrizaron en Río! Misión cumplida.',
    emergency: '😅 Tuvieron que aterrizar de emergencia antes de llegar a Río.',
  },
]

export function pickFlightStory(): FlightStory {
  return FLIGHT_STORIES[Math.floor(Math.random() * FLIGHT_STORIES.length)]
}

export function storyMilestones(totalRounds: number): number[] {
  if (totalRounds <= 2) return [0]
  const raw = [0, Math.floor(totalRounds / 3), Math.floor((2 * totalRounds) / 3)]
  return Array.from(new Set(raw))
}
