import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadStreak, recordActivityToday } from './streak'

function setNow(iso: string) {
  vi.setSystemTime(new Date(iso))
}

describe('streak', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts at zero', () => {
    expect(loadStreak()).toEqual({ lastActiveDate: '', currentStreak: 0, longestStreak: 0 })
  })

  it('starts a streak of 1 on first activity', () => {
    setNow('2026-01-01T10:00:00Z')
    const data = recordActivityToday()
    expect(data.currentStreak).toBe(1)
    expect(data.longestStreak).toBe(1)
  })

  it('does not double-count activity on the same day', () => {
    setNow('2026-01-01T10:00:00Z')
    recordActivityToday()
    setNow('2026-01-01T18:00:00Z')
    const data = recordActivityToday()
    expect(data.currentStreak).toBe(1)
  })

  it('increments the streak on consecutive days', () => {
    setNow('2026-01-01T10:00:00Z')
    recordActivityToday()
    setNow('2026-01-02T10:00:00Z')
    recordActivityToday()
    setNow('2026-01-03T10:00:00Z')
    const data = recordActivityToday()
    expect(data.currentStreak).toBe(3)
    expect(data.longestStreak).toBe(3)
  })

  it('resets the streak after a missed day but keeps the longest', () => {
    setNow('2026-01-01T10:00:00Z')
    recordActivityToday()
    setNow('2026-01-02T10:00:00Z')
    recordActivityToday()
    setNow('2026-01-05T10:00:00Z')
    const data = recordActivityToday()
    expect(data.currentStreak).toBe(1)
    expect(data.longestStreak).toBe(2)
  })
})
