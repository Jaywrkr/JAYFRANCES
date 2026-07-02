import { GROUPS } from '../data/categories'
import { VOCAB } from '../data/vocab'
import { isGenderable } from '../lib/exercises'
import type { ExerciseType } from '../types'

interface Props {
  groupId: string
  onBack: () => void
  onStart: (exerciseType: ExerciseType) => void
}

const EXERCISE_INFO: Record<ExerciseType, { label: string; emoji: string; desc: string }> = {
  flashcards: {
    label: 'Flashcards',
    emoji: '🗂️',
    desc: 'Tarjetas con repetición espaciada: repasa más las que no sabes',
  },
  opcion_multiple: {
    label: 'Opción múltiple',
    emoji: '✅',
    desc: 'Elige el significado correcto entre 4 opciones',
  },
  genero: {
    label: 'Masculino o femenino',
    emoji: '⚖️',
    desc: 'Practica el género — lo que más cuesta memorizar',
  },
  conjugacion: {
    label: 'Conjugación',
    emoji: '🔤',
    desc: 'Elige la forma correcta del verbo según la persona',
  },
  completar: {
    label: 'Escribir la palabra',
    emoji: '✍️',
    desc: 'Ves la traducción en español y escribes la palabra en francés',
  },
}

export default function ExercisePicker({ groupId, onBack, onStart }: Props) {
  const group = GROUPS.find((g) => g.id === groupId)!
  const entries = VOCAB.filter((v) => group.cats.includes(v.cat))
  const genderableCount = entries.filter(isGenderable).length
  const conjugableCount = entries.filter((e) => e.cat === 'verbo_conjugado').length

  const available: ExerciseType[] = ['flashcards', 'opcion_multiple']
  if (genderableCount >= 4) available.push('genero')
  if (conjugableCount >= 4) available.push('conjugacion')
  available.push('completar')

  return (
    <div className="max-w-2xl mx-auto px-4 pb-16 pt-8">
      <button onClick={onBack} className="text-sky-400 text-sm mb-4 tap-scale">
        ← Volver a categorías
      </button>
      <div className="mb-6 text-center">
        <div className="text-3xl mb-1">{group.emoji}</div>
        <h1 className="text-xl font-bold">{group.label}</h1>
        <p className="text-slate-400 text-sm mt-1">{group.desc}</p>
      </div>

      <div className="flex flex-col gap-3">
        {available.map((ex) => (
          <button
            key={ex}
            onClick={() => onStart(ex)}
            className="tap-scale text-left rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-600/60 hover:bg-slate-900 p-4 flex items-center gap-4"
          >
            <span className="text-2xl">{EXERCISE_INFO[ex].emoji}</span>
            <div>
              <div className="font-semibold text-slate-100">{EXERCISE_INFO[ex].label}</div>
              <div className="text-xs text-slate-400">{EXERCISE_INFO[ex].desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
