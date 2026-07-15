import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getWeeklyComparison, loadActivityLog, recordReview } from './activityLog'

function setNow(iso: string) {
  vi.setSystemTime(new Date(iso))
}

describe('activityLog', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts empty', () => {
    expect(loadActivityLog()).toEqual({})
  })

  it('accumulates seen/correct counts per day', () => {
    setNow('2026-01-01T10:00:00Z')
    recordReview(true)
    recordReview(false)
    const log = recordReview(true)
    expect(log['2026-01-01']).toEqual({ seen: 3, correct: 2 })
  })

  it('keeps separate buckets per day', () => {
    setNow('2026-01-01T10:00:00Z')
    recordReview(true)
    setNow('2026-01-02T10:00:00Z')
    recordReview(true)
    const log = loadActivityLog()
    expect(Object.keys(log).sort()).toEqual(['2026-01-01', '2026-01-02'])
  })

  it('compares this week vs last week review counts', () => {
    setNow('2026-01-15T10:00:00Z') // día 0 de "esta semana"
    recordReview(true)
    recordReview(true)
    setNow('2026-01-10T10:00:00Z') // 5 días antes -> "esta semana" (dentro de 7 días)
    recordReview(true)
    setNow('2026-01-05T10:00:00Z') // 10 días antes -> "semana pasada"
    recordReview(true)
    recordReview(false)

    setNow('2026-01-15T10:00:00Z')
    const comparison = getWeeklyComparison()
    expect(comparison.thisWeek).toBe(3)
    expect(comparison.lastWeek).toBe(2)
  })
})
