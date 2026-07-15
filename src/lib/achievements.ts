import { groupMastery } from './progress'
import { getState, isMastered } from './srs'
import type { SrsStore, VocabEntry } from '../types'
import type { StreakData } from './streak'

export interface Achievement {
  id: string
  emoji: string
  label: string
  description: string
  achieved: boolean
}

export function getAchievements(
  vocab: VocabEntry[],
  srs: SrsStore,
  streak: StreakData,
  customWordCount: number
): Achievement[] {
  const masteredCount = vocab.filter((v) => isMastered(getState(srs, v.id))).length
  const totalSeen = vocab.reduce((sum, v) => sum + getState(srs, v.id).seen, 0)
  const overallMastery = groupMastery(srs, vocab)

  return [
    {
      id: 'first-review',
      emoji: '🌱',
      label: 'Primer paso',
      description: 'Repasa tu primera palabra',
      achieved: totalSeen >= 1,
    },
    {
      id: 'mastered-10',
      emoji: '🎯',
      label: '10 palabras dominadas',
      description: 'Domina 10 palabras',
      achieved: masteredCount >= 10,
    },
    {
      id: 'mastered-50',
      emoji: '🏅',
      label: '50 palabras dominadas',
      description: 'Domina 50 palabras',
      achieved: masteredCount >= 50,
    },
    {
      id: 'halfway',
      emoji: '📈',
      label: 'Mitad del camino',
      description: 'Alcanza 50% de dominio general',
      achieved: overallMastery >= 50,
    },
    {
      id: 'all-mastered',
      emoji: '👑',
      label: 'Todo dominado',
      description: 'Alcanza 100% de dominio general',
      achieved: overallMastery >= 100,
    },
    {
      id: 'reviews-100',
      emoji: '💯',
      label: '100 repasos',
      description: 'Completa 100 repasos en total',
      achieved: totalSeen >= 100,
    },
    {
      id: 'streak-3',
      emoji: '🔥',
      label: 'Racha de 3 días',
      description: 'Practica 3 días seguidos',
      achieved: streak.longestStreak >= 3,
    },
    {
      id: 'streak-7',
      emoji: '🔥',
      label: 'Racha de 7 días',
      description: 'Practica 7 días seguidos',
      achieved: streak.longestStreak >= 7,
    },
    {
      id: 'custom-word',
      emoji: '✍️',
      label: 'Tu propio vocabulario',
      description: 'Agrega tu primera palabra propia',
      achieved: customWordCount >= 1,
    },
  ]
}
