export type VocabCat =
  | 'pronombre_sujeto'
  | 'pronombre_tonico'
  | 'posesivo'
  | 'posesivo_frase'
  | 'articulo'
  | 'interrogativo'
  | 'preposicion'
  | 'preposicion_frase'
  | 'conjuncion'
  | 'interjeccion'
  | 'numero'
  | 'expresion'
  | 'pais'
  | 'nacionalidad'
  | 'verbo_conjugado'
  | 'verbo_infinitivo'
  | 'indefinido'
  | 'adverbio'
  | 'adverbio_frase'
  | 'sustantivo'
  | 'adjetivo'

export type GroupId =
  | 'pronombres'
  | 'posesivos'
  | 'articulos'
  | 'verbos'
  | 'sustantivos'
  | 'adjetivos'
  | 'adverbios'
  | 'preposiciones'
  | 'interrogativos'
  | 'conectores'
  | 'numeros'
  | 'expresiones'
  | 'paises'

export interface VocabEntry {
  fr: string
  es: string
  cat: VocabCat
  gender?: string
  art_type?: string
  possessive_gender?: string
  infinitivo?: string
  persona?: string
  tense?: string
  id: string
}

export type ExerciseType =
  | 'flashcards'
  | 'opcion_multiple'
  | 'genero'
  | 'conjugacion'
  | 'completar'
  | 'dictado'

export interface SrsState {
  repetitions: number // repeticiones correctas consecutivas
  easeFactor: number // factor de facilidad SM-2 (>= 1.3)
  intervalDays: number // intervalo actual en días
  dueAt: number // epoch ms
  seen: number
  correct: number
}

// Formato viejo (Leitner), guardado en localStorage antes de migrar a SM-2.
export interface LegacySrsState {
  box: number
  dueAt: number
  seen: number
  correct: number
}

export type SrsStore = Record<string, SrsState>
