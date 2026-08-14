import { beforeEach, describe, expect, it } from 'vitest'
import { getState, isDue, isMastered, loadSrs, masteryLabel, reviewCard, saveSrs } from './srs'

describe('srs (SM-2)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns a default state for unseen cards', () => {
    const state = getState({}, 'bonjour')
    expect(state).toEqual({ repetitions: 0, easeFactor: 2.5, intervalDays: 0, dueAt: 0, seen: 0, correct: 0 })
  })

  it('grows repetitions and interval on consecutive correct reviews', () => {
    let store = reviewCard({}, 'chat', true)
    expect(getState(store, 'chat').repetitions).toBe(1)
    expect(getState(store, 'chat').intervalDays).toBe(1)

    store = reviewCard(store, 'chat', true)
    expect(getState(store, 'chat').repetitions).toBe(2)
    expect(getState(store, 'chat').intervalDays).toBe(6)

    store = reviewCard(store, 'chat', true)
    expect(getState(store, 'chat').repetitions).toBe(3)
    expect(getState(store, 'chat').intervalDays).toBeGreaterThan(6)
  })

  it('resets repetitions and shortens the interval on a miss', () => {
    let store = reviewCard({}, 'chien', true)
    store = reviewCard(store, 'chien', true)
    store = reviewCard(store, 'chien', false)
    const state = getState(store, 'chien')
    expect(state.repetitions).toBe(0)
    expect(state.intervalDays).toBe(0)
    expect(state.dueAt).toBeLessThanOrEqual(Date.now() + 10 * 60_000 + 1000)
  })

  it('never lets the ease factor drop below the SM-2 floor', () => {
    let store = {}
    for (let i = 0; i < 20; i++) store = reviewCard(store, 'difficile', false)
    expect(getState(store, 'difficile').easeFactor).toBeGreaterThanOrEqual(1.3)
  })

  it('tracks seen and correct counts', () => {
    let store = reviewCard({}, 'maison', true)
    store = reviewCard(store, 'maison', false)
    const state = getState(store, 'maison')
    expect(state.seen).toBe(2)
    expect(state.correct).toBe(1)
  })

  it('treats a card with no history as due', () => {
    expect(isDue({}, 'nouveau')).toBe(true)
  })

  it('treats a freshly reviewed card as not due', () => {
    const store = reviewCard({}, 'jour', true)
    expect(isDue(store, 'jour')).toBe(false)
  })

  it('persists and reloads via localStorage', () => {
    const store = reviewCard({}, 'eau', true)
    saveSrs(store)
    expect(loadSrs()).toEqual(store)
  })

  it('recovers gracefully from corrupted localStorage', () => {
    localStorage.setItem('jayfrances_srs_v1', '{not json')
    expect(loadSrs()).toEqual({})
  })

  it('migrates legacy Leitner-format entries on load', () => {
    localStorage.setItem(
      'jayfrances_srs_v1',
      JSON.stringify({ chat: { box: 3, dueAt: 12345, seen: 4, correct: 3 } })
    )
    const loaded = loadSrs()
    expect(loaded.chat).toEqual({
      repetitions: 3,
      easeFactor: 2.5,
      intervalDays: 2,
      dueAt: 12345,
      seen: 4,
      correct: 3,
    })
  })

  it('flags mastery once repetitions reach the threshold', () => {
    expect(isMastered({ repetitions: 5, easeFactor: 2.5, intervalDays: 30, dueAt: 0, seen: 5, correct: 5 })).toBe(true)
    expect(isMastered({ repetitions: 4, easeFactor: 2.5, intervalDays: 12, dueAt: 0, seen: 4, correct: 4 })).toBe(false)
  })

  it('labels mastery from the repetitions count', () => {
    expect(masteryLabel(0)).toBe('Nuevo')
    expect(masteryLabel(2)).toBe('Aprendiendo')
    expect(masteryLabel(4)).toBe('Repasando')
    expect(masteryLabel(5)).toBe('Dominado')
  })
})
