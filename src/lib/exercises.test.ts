import { describe, expect, it } from 'vitest'
import {
  buildCompletarQuestion,
  buildConjugationQuestion,
  buildGenderQuestion,
  buildMultipleChoice,
  firstGloss,
  isGenderable,
  normalize,
  pick,
  shuffle,
} from './exercises'
import type { VocabEntry } from '../types'

const pool: VocabEntry[] = [
  { id: 'chat', fr: 'chat', es: 'gato, minino', cat: 'sustantivo', gender: 'm' },
  { id: 'maison', fr: 'maison', es: 'casa', cat: 'sustantivo', gender: 'f' },
  { id: 'chien', fr: 'chien', es: 'perro', cat: 'sustantivo', gender: 'm' },
  { id: 'porte', fr: 'porte', es: 'puerta', cat: 'sustantivo', gender: 'f' },
  {
    id: 'etre-je',
    fr: 'suis',
    es: 'soy',
    cat: 'verbo_conjugado',
    infinitivo: 'être',
    persona: 'je',
  },
  {
    id: 'etre-tu',
    fr: 'es',
    es: 'eres',
    cat: 'verbo_conjugado',
    infinitivo: 'être',
    persona: 'tu',
  },
]

describe('shuffle/pick', () => {
  it('shuffle keeps the same elements without mutating the input', () => {
    const arr = [1, 2, 3, 4]
    const result = shuffle(arr)
    expect(arr).toEqual([1, 2, 3, 4])
    expect(result.sort()).toEqual([1, 2, 3, 4])
  })

  it('pick returns at most n unique elements', () => {
    const result = pick([1, 2, 3, 4, 5], 3)
    expect(result).toHaveLength(3)
    expect(new Set(result).size).toBe(3)
  })
})

describe('firstGloss/normalize', () => {
  it('takes the first comma-separated meaning', () => {
    expect(firstGloss('gato, minino')).toBe('gato')
  })

  it('normalizes accents, apostrophes and case for comparison', () => {
    expect(normalize("Là-bas ’tis")).toBe(normalize("la-bas 'tis"))
  })
})

describe('buildMultipleChoice', () => {
  it('includes the correct answer among the options, fr2es', () => {
    const q = buildMultipleChoice(pool[0], pool, 'fr2es')
    expect(q.options).toContain(q.answer)
    expect(q.answer).toBe('gato')
    expect(q.prompt).toBe('chat')
  })

  it('includes the correct answer among the options, es2fr', () => {
    const q = buildMultipleChoice(pool[0], pool, 'es2fr')
    expect(q.options).toContain(q.answer)
    expect(q.answer).toBe('chat')
  })
})

describe('gender questions', () => {
  it('flags only m/f entries as genderable', () => {
    expect(isGenderable(pool[0])).toBe(true)
    expect(isGenderable(pool[4])).toBe(false)
  })

  it('builds a gender question with the right answer', () => {
    const q = buildGenderQuestion(pool[0])
    expect(q.answer).toBe('m')
    expect(q.word).toBe('chat')
  })
})

describe('conjugation questions', () => {
  it('builds options containing the correct conjugated form', () => {
    const q = buildConjugationQuestion(pool[4], pool)
    expect(q.options).toContain('suis')
    expect(q.answer).toBe('suis')
    expect(q.infinitivo).toBe('être')
  })
})

describe('completar questions', () => {
  it('asks for the french word given the spanish hint', () => {
    const q = buildCompletarQuestion(pool[1])
    expect(q.hintEs).toBe('casa')
    expect(q.answer).toBe('maison')
  })
})
