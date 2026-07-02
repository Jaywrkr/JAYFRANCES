import type { VocabCat, GroupId } from '../types'

export interface GroupDef {
  id: GroupId
  label: string
  emoji: string
  desc: string
  cats: VocabCat[]
}

export const GROUPS: GroupDef[] = [
  {
    id: 'pronombres',
    label: 'Pronombres',
    emoji: '🙋',
    desc: 'je, tu, il, elle... y los pronombres tónicos (moi, toi)',
    cats: ['pronombre_sujeto', 'pronombre_tonico'],
  },
  {
    id: 'posesivos',
    label: 'Posesivos',
    emoji: '👪',
    desc: 'mon/ma/mes, ton/ta, notre, votre — el más difícil: concuerdan con la cosa poseída, no con quien posee',
    cats: ['posesivo', 'posesivo_frase'],
  },
  {
    id: 'articulos',
    label: 'Artículos',
    emoji: '🏷️',
    desc: 'le/la/les, un/une/des, du — y cuándo usar cada uno',
    cats: ['articulo'],
  },
  {
    id: 'verbos',
    label: 'Verbos',
    emoji: '🏃',
    desc: 'infinitivos y conjugaciones de être, avoir, aller, vouloir, venir, connaître...',
    cats: ['verbo_infinitivo', 'verbo_conjugado'],
  },
  {
    id: 'sustantivos',
    label: 'Sustantivos (género)',
    emoji: '📦',
    desc: 'masculino o femenino — la categoría que más cuesta memorizar',
    cats: ['sustantivo'],
  },
  {
    id: 'adjetivos',
    label: 'Adjetivos',
    emoji: '🎨',
    desc: 'descripciones y su forma según el género',
    cats: ['adjetivo'],
  },
  {
    id: 'adverbios',
    label: 'Adverbios',
    emoji: '⏱️',
    desc: 'très, beaucoup, souvent, déjà... palabras invariables',
    cats: ['adverbio', 'adverbio_frase'],
  },
  {
    id: 'preposiciones',
    label: 'Preposiciones',
    emoji: '🧭',
    desc: 'à, de, dans, avec, chez... y sus contracciones (au, du)',
    cats: ['preposicion', 'preposicion_frase'],
  },
  {
    id: 'interrogativos',
    label: 'Interrogativos',
    emoji: '❓',
    desc: 'qui, où, quand, comment, pourquoi — para hacer preguntas',
    cats: ['interrogativo'],
  },
  {
    id: 'conectores',
    label: 'Conjunciones e interjecciones',
    emoji: '🔗',
    desc: 'et, ou, mais, parce que... y expresiones cortas como ah, oui, non',
    cats: ['conjuncion', 'interjeccion', 'indefinido'],
  },
  {
    id: 'numeros',
    label: 'Números',
    emoji: '🔢',
    desc: 'del uno al diez',
    cats: ['numero'],
  },
  {
    id: 'expresiones',
    label: 'Expresiones y saludos',
    emoji: '💬',
    desc: 'frases fijas: bonjour, merci, comment tu t\'appelles...',
    cats: ['expresion'],
  },
  {
    id: 'paises',
    label: 'Países y nacionalidades',
    emoji: '🌍',
    desc: 'France, français/française... y su concordancia',
    cats: ['pais', 'nacionalidad'],
  },
]

export const GROUP_BY_CAT: Record<VocabCat, GroupId> = GROUPS.reduce((acc, g) => {
  for (const c of g.cats) acc[c] = g.id
  return acc
}, {} as Record<VocabCat, GroupId>)
