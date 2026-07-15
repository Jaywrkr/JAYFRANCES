import { beforeEach, describe, expect, it } from 'vitest'
import { addCustomWord, loadCustomVocab, removeCustomWord } from './customVocab'

describe('customVocab', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts empty', () => {
    expect(loadCustomVocab()).toEqual([])
  })

  it('adds a word and assigns it an id', () => {
    const updated = addCustomWord({ fr: 'bibliothèque', es: 'biblioteca', cat: 'sustantivo', gender: 'f' })
    expect(updated).toHaveLength(1)
    expect(updated[0].fr).toBe('bibliothèque')
    expect(updated[0].id).toBeTruthy()
  })

  it('persists added words across loads', () => {
    addCustomWord({ fr: 'stylo', es: 'lapicero', cat: 'sustantivo', gender: 'm' })
    expect(loadCustomVocab()).toHaveLength(1)
  })

  it('removes a word by id', () => {
    const [added] = addCustomWord({ fr: 'fenêtre', es: 'ventana', cat: 'sustantivo', gender: 'f' })
    const updated = removeCustomWord(added.id)
    expect(updated).toHaveLength(0)
    expect(loadCustomVocab()).toHaveLength(0)
  })
})
