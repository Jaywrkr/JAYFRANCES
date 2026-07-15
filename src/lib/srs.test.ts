import { beforeEach, describe, expect, it } from 'vitest'
import { getState, isDue, loadSrs, masteryLabel, reviewCard, saveSrs } from './srs'

describe('srs', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns a default state for unseen cards', () => {
    const state = getState({}, 'bonjour')
    expect(state).toEqual({ box: 0, dueAt: 0, seen: 0, correct: 0 })
  })

  it('advances the box on a correct review and resets on a miss', () => {
    let store = reviewCard({}, 'chat', true)
    expect(getState(store, 'chat').box).toBe(1)
    store = reviewCard(store, 'chat', true)
    expect(getState(store, 'chat').box).toBe(2)
    store = reviewCard(store, 'chat', false)
    expect(getState(store, 'chat').box).toBe(0)
  })

  it('never advances the box past the max', () => {
    let store = {}
    for (let i = 0; i < 10; i++) store = reviewCard(store, 'chien', true)
    expect(getState(store, 'chien').box).toBeLessThanOrEqual(5)
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

  it('labels mastery from the box number', () => {
    expect(masteryLabel(0)).toBe('Nuevo')
    expect(masteryLabel(2)).toBe('Aprendiendo')
    expect(masteryLabel(4)).toBe('Repasando')
    expect(masteryLabel(5)).toBe('Dominado')
  })
})
