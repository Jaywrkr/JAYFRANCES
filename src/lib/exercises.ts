import type { VocabEntry } from '../types'

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function pick<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n)
}

export interface MCQuestion {
  kind: 'mc'
  prompt: string
  promptLabel: string
  options: string[]
  answer: string
  entry: VocabEntry
}

export function buildMultipleChoice(
  entry: VocabEntry,
  pool: VocabEntry[],
  direction: 'fr2es' | 'es2fr'
): MCQuestion {
  const others = pool.filter((p) => p.id !== entry.id)
  const distractors = pick(others, Math.min(3, others.length)).map((p) =>
    direction === 'fr2es' ? firstGloss(p.es) : p.fr
  )
  const answer = direction === 'fr2es' ? firstGloss(entry.es) : entry.fr
  const options = shuffle([...new Set([answer, ...distractors])])
  return {
    kind: 'mc',
    prompt: direction === 'fr2es' ? entry.fr : firstGloss(entry.es),
    promptLabel: direction === 'fr2es' ? '¿Qué significa?' : '¿Cómo se dice en francés?',
    options,
    answer,
    entry,
  }
}

export function firstGloss(es: string): string {
  return es.split(',')[0].trim()
}

export interface GenderQuestion {
  kind: 'gender'
  word: string
  hintEs: string
  answer: 'm' | 'f'
  entry: VocabEntry
}

export function isGenderable(e: VocabEntry): boolean {
  return e.gender === 'm' || e.gender === 'f'
}

export function buildGenderQuestion(entry: VocabEntry): GenderQuestion {
  return {
    kind: 'gender',
    word: entry.fr,
    hintEs: firstGloss(entry.es),
    answer: entry.gender as 'm' | 'f',
    entry,
  }
}

export interface ConjugationQuestion {
  kind: 'conj'
  infinitivo: string
  persona: string
  tense?: string
  options: string[]
  answer: string
  entry: VocabEntry
}

export function buildConjugationQuestion(
  entry: VocabEntry,
  pool: VocabEntry[]
): ConjugationQuestion {
  const entryTense = entry.tense ?? 'presente'
  const sameVerbSameTense = pool.filter(
    (p) =>
      p.cat === 'verbo_conjugado' &&
      p.infinitivo === entry.infinitivo &&
      (p.tense ?? 'presente') === entryTense &&
      p.id !== entry.id
  )
  const otherVerbsSameTense = pool.filter(
    (p) =>
      p.cat === 'verbo_conjugado' &&
      p.infinitivo !== entry.infinitivo &&
      (p.tense ?? 'presente') === entryTense
  )
  let distractors = pick(sameVerbSameTense, Math.min(3, sameVerbSameTense.length)).map((p) => p.fr)
  if (distractors.length < 3) {
    const extra = pick(otherVerbsSameTense, 3 - distractors.length).map((p) => p.fr)
    distractors = [...distractors, ...extra]
  }
  const options = shuffle([...new Set([entry.fr, ...distractors])])
  return {
    kind: 'conj',
    infinitivo: entry.infinitivo!,
    persona: entry.persona!,
    tense: entry.tense,
    options,
    answer: entry.fr,
    entry,
  }
}

export interface CompletarQuestion {
  kind: 'completar'
  hintEs: string
  answer: string
  entry: VocabEntry
}

export function buildCompletarQuestion(entry: VocabEntry): CompletarQuestion {
  return {
    kind: 'completar',
    hintEs: firstGloss(entry.es),
    answer: entry.fr,
    entry,
  }
}

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’]/g, "'")
    .trim()
}
