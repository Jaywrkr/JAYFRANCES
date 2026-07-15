import type { VocabEntry } from '../types'

const PERSONA_PRONOUN: Record<string, string> = {
  yo: 'Je',
  tú: 'Tu',
  'él/ella': 'Il/Elle',
  él: 'Il',
  ella: 'Elle',
  nosotros: 'Nous',
  'usted/ustedes': 'Vous',
  'ellos/ellas': 'Ils/Elles',
}

// Complementos naturales por infinitivo, para que la frase generada tenga sentido
// gramatical con cualquier persona (evita errores de concordancia forzada).
const VERB_COMPLEMENT: Record<string, string> = {
  être: 'fatigué.',
  avoir: 'faim.',
  venir: 'de Paris.',
  aller: 'au marché.',
  vouloir: 'un café.',
  connaître: 'cette ville.',
  habiter: 'à Paris.',
  parler: 'français.',
  adorer: 'le chocolat.',
  étudier: 'le français.',
}

export function buildExampleSentence(entry: VocabEntry): { fr: string; es: string } | null {
  if (entry.cat === 'verbo_conjugado' && entry.infinitivo && entry.persona) {
    const pronoun = PERSONA_PRONOUN[entry.persona]
    const complement = VERB_COMPLEMENT[entry.infinitivo]
    if (pronoun && complement) {
      return {
        fr: `${pronoun} ${entry.fr} ${complement}`,
        es: `(${entry.infinitivo}) ejemplo con la persona: ${entry.persona}`,
      }
    }
  }

  if (entry.cat === 'sustantivo' && (entry.gender === 'm' || entry.gender === 'f')) {
    const art = entry.gender === 'm' ? 'le' : 'la'
    return {
      fr: `Voici ${art} ${entry.fr}.`,
      es: `Aquí está el/la ${entry.es.split(',')[0].trim()}.`,
    }
  }

  if (entry.cat === 'adjetivo') {
    return {
      fr: `C'est très ${entry.fr}.`,
      es: `Es muy ${entry.es.split(',')[0].trim()}.`,
    }
  }

  if (entry.cat === 'numero') {
    return {
      fr: `Il y a ${entry.fr} pommes.`,
      es: `Hay ${entry.es.split(',')[0].trim()} manzanas.`,
    }
  }

  return null
}
