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
  id: string
}

export type ExerciseType =
  | 'flashcards'
  | 'opcion_multiple'
  | 'genero'
  | 'conjugacion'
  | 'completar'

export interface SrsState {
  box: number // 0..5
  dueAt: number // epoch ms
  seen: number
  correct: number
}

export type SrsStore = Record<string, SrsState>
