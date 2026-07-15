import { beforeEach, describe, expect, it } from 'vitest'
import { loadSessionHistory, recordSession } from './sessionHistory'

describe('sessionHistory', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts empty', () => {
    expect(loadSessionHistory()).toEqual([])
  })

  it('records a session with the most recent first', () => {
    recordSession({ groupId: 'verbos', exerciseType: 'conjugacion', correct: 8, total: 10 })
    const updated = recordSession({ groupId: 'numeros', exerciseType: 'flashcards', correct: 5, total: 5 })
    expect(updated).toHaveLength(2)
    expect(updated[0].groupId).toBe('numeros')
    expect(updated[1].groupId).toBe('verbos')
  })

  it('caps history at 200 entries', () => {
    for (let i = 0; i < 205; i++) {
      recordSession({ groupId: 'numeros', exerciseType: 'flashcards', correct: 1, total: 1 })
    }
    expect(loadSessionHistory()).toHaveLength(200)
  })
})
