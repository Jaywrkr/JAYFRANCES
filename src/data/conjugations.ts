import type { VocabEntry } from '../types'

export type Tense = 'presente' | 'imperfecto' | 'futuro' | 'pasado_compuesto'

export const TENSE_LABEL: Record<Tense, string> = {
  presente: 'presente',
  imperfecto: 'imparfait (pretérito imperfecto)',
  futuro: 'futur simple (futuro)',
  pasado_compuesto: 'passé composé (pretérito perfecto)',
}

export const PERSONAS = ['yo', 'tú', 'él/ella', 'nosotros', 'usted/ustedes', 'ellos/ellas'] as const
export type Persona = (typeof PERSONAS)[number]

type ConjugationRow = Record<Persona, string>

export const VERBS = [
  'être',
  'avoir',
  'venir',
  'aller',
  'vouloir',
  'connaître',
  'habiter',
  'parler',
  'adorer',
  'étudier',
] as const

// Tiempos verbales adicionales generados a mano (el presente ya vive en vocab_raw.json).
export const CONJUGATIONS: Record<string, Partial<Record<Tense, ConjugationRow>>> = {
  être: {
    imperfecto: { yo: 'étais', tú: 'étais', 'él/ella': 'était', nosotros: 'étions', 'usted/ustedes': 'étiez', 'ellos/ellas': 'étaient' },
    futuro: { yo: 'serai', tú: 'seras', 'él/ella': 'sera', nosotros: 'serons', 'usted/ustedes': 'serez', 'ellos/ellas': 'seront' },
    pasado_compuesto: { yo: 'ai été', tú: 'as été', 'él/ella': 'a été', nosotros: 'avons été', 'usted/ustedes': 'avez été', 'ellos/ellas': 'ont été' },
  },
  avoir: {
    imperfecto: { yo: 'avais', tú: 'avais', 'él/ella': 'avait', nosotros: 'avions', 'usted/ustedes': 'aviez', 'ellos/ellas': 'avaient' },
    futuro: { yo: 'aurai', tú: 'auras', 'él/ella': 'aura', nosotros: 'aurons', 'usted/ustedes': 'aurez', 'ellos/ellas': 'auront' },
    pasado_compuesto: { yo: 'ai eu', tú: 'as eu', 'él/ella': 'a eu', nosotros: 'avons eu', 'usted/ustedes': 'avez eu', 'ellos/ellas': 'ont eu' },
  },
  venir: {
    imperfecto: { yo: 'venais', tú: 'venais', 'él/ella': 'venait', nosotros: 'venions', 'usted/ustedes': 'veniez', 'ellos/ellas': 'venaient' },
    futuro: { yo: 'viendrai', tú: 'viendras', 'él/ella': 'viendra', nosotros: 'viendrons', 'usted/ustedes': 'viendrez', 'ellos/ellas': 'viendront' },
    pasado_compuesto: { yo: 'suis venu(e)', tú: 'es venu(e)', 'él/ella': 'est venu(e)', nosotros: 'sommes venu(e)s', 'usted/ustedes': 'êtes venu(e)(s)', 'ellos/ellas': 'sont venu(e)s' },
  },
  aller: {
    imperfecto: { yo: 'allais', tú: 'allais', 'él/ella': 'allait', nosotros: 'allions', 'usted/ustedes': 'alliez', 'ellos/ellas': 'allaient' },
    futuro: { yo: 'irai', tú: 'iras', 'él/ella': 'ira', nosotros: 'irons', 'usted/ustedes': 'irez', 'ellos/ellas': 'iront' },
    pasado_compuesto: { yo: 'suis allé(e)', tú: 'es allé(e)', 'él/ella': 'est allé(e)', nosotros: 'sommes allé(e)s', 'usted/ustedes': 'êtes allé(e)(s)', 'ellos/ellas': 'sont allé(e)s' },
  },
  vouloir: {
    imperfecto: { yo: 'voulais', tú: 'voulais', 'él/ella': 'voulait', nosotros: 'voulions', 'usted/ustedes': 'vouliez', 'ellos/ellas': 'voulaient' },
    futuro: { yo: 'voudrai', tú: 'voudras', 'él/ella': 'voudra', nosotros: 'voudrons', 'usted/ustedes': 'voudrez', 'ellos/ellas': 'voudront' },
    pasado_compuesto: { yo: 'ai voulu', tú: 'as voulu', 'él/ella': 'a voulu', nosotros: 'avons voulu', 'usted/ustedes': 'avez voulu', 'ellos/ellas': 'ont voulu' },
  },
  connaître: {
    imperfecto: { yo: 'connaissais', tú: 'connaissais', 'él/ella': 'connaissait', nosotros: 'connaissions', 'usted/ustedes': 'connaissiez', 'ellos/ellas': 'connaissaient' },
    futuro: { yo: 'connaîtrai', tú: 'connaîtras', 'él/ella': 'connaîtra', nosotros: 'connaîtrons', 'usted/ustedes': 'connaîtrez', 'ellos/ellas': 'connaîtront' },
    pasado_compuesto: { yo: 'ai connu', tú: 'as connu', 'él/ella': 'a connu', nosotros: 'avons connu', 'usted/ustedes': 'avez connu', 'ellos/ellas': 'ont connu' },
  },
  habiter: {
    imperfecto: { yo: 'habitais', tú: 'habitais', 'él/ella': 'habitait', nosotros: 'habitions', 'usted/ustedes': 'habitiez', 'ellos/ellas': 'habitaient' },
    futuro: { yo: 'habiterai', tú: 'habiteras', 'él/ella': 'habitera', nosotros: 'habiterons', 'usted/ustedes': 'habiterez', 'ellos/ellas': 'habiteront' },
    pasado_compuesto: { yo: 'ai habité', tú: 'as habité', 'él/ella': 'a habité', nosotros: 'avons habité', 'usted/ustedes': 'avez habité', 'ellos/ellas': 'ont habité' },
  },
  parler: {
    imperfecto: { yo: 'parlais', tú: 'parlais', 'él/ella': 'parlait', nosotros: 'parlions', 'usted/ustedes': 'parliez', 'ellos/ellas': 'parlaient' },
    futuro: { yo: 'parlerai', tú: 'parleras', 'él/ella': 'parlera', nosotros: 'parlerons', 'usted/ustedes': 'parlerez', 'ellos/ellas': 'parleront' },
    pasado_compuesto: { yo: 'ai parlé', tú: 'as parlé', 'él/ella': 'a parlé', nosotros: 'avons parlé', 'usted/ustedes': 'avez parlé', 'ellos/ellas': 'ont parlé' },
  },
  adorer: {
    imperfecto: { yo: 'adorais', tú: 'adorais', 'él/ella': 'adorait', nosotros: 'adorions', 'usted/ustedes': 'adoriez', 'ellos/ellas': 'adoraient' },
    futuro: { yo: 'adorerai', tú: 'adoreras', 'él/ella': 'adorera', nosotros: 'adorerons', 'usted/ustedes': 'adorerez', 'ellos/ellas': 'adoreront' },
    pasado_compuesto: { yo: 'ai adoré', tú: 'as adoré', 'él/ella': 'a adoré', nosotros: 'avons adoré', 'usted/ustedes': 'avez adoré', 'ellos/ellas': 'ont adoré' },
  },
  étudier: {
    imperfecto: { yo: 'étudiais', tú: 'étudiais', 'él/ella': 'étudiait', nosotros: 'étudiions', 'usted/ustedes': 'étudiiez', 'ellos/ellas': 'étudiaient' },
    futuro: { yo: 'étudierai', tú: 'étudieras', 'él/ella': 'étudiera', nosotros: 'étudierons', 'usted/ustedes': 'étudierez', 'ellos/ellas': 'étudieront' },
    pasado_compuesto: { yo: 'ai étudié', tú: 'as étudié', 'él/ella': 'a étudié', nosotros: 'avons étudié', 'usted/ustedes': 'avez étudié', 'ellos/ellas': 'ont étudié' },
  },
}

// Genera entradas de vocabulario sintéticas para los tiempos verbales adicionales
// (el presente ya vive en vocab_raw.json y no se regenera aquí).
export function generateConjugationEntries(): VocabEntry[] {
  const entries: VocabEntry[] = []
  for (const infinitivo of VERBS) {
    const tenses = CONJUGATIONS[infinitivo]
    if (!tenses) continue
    for (const tense of Object.keys(tenses) as Tense[]) {
      const row = tenses[tense]!
      for (const persona of PERSONAS) {
        entries.push({
          id: `${infinitivo}-${tense}-${persona}`,
          fr: row[persona],
          es: `(${TENSE_LABEL[tense]}) ${infinitivo} — ${persona}`,
          cat: 'verbo_conjugado',
          infinitivo,
          persona,
          tense,
        })
      }
    }
  }
  return entries
}
