import { useState } from 'react'
import { addCustomWord, removeCustomWord } from '../lib/customVocab'
import type { VocabCat, VocabEntry } from '../types'

interface Props {
  customVocab: VocabEntry[]
  onChange: (entries: VocabEntry[]) => void
  onBack: () => void
}

const CAT_OPTIONS: { value: VocabCat; label: string; needsGender: boolean }[] = [
  { value: 'sustantivo', label: 'Sustantivo', needsGender: true },
  { value: 'adjetivo', label: 'Adjetivo', needsGender: true },
  { value: 'verbo_infinitivo', label: 'Verbo (infinitivo)', needsGender: false },
  { value: 'adverbio', label: 'Adverbio', needsGender: false },
  { value: 'expresion', label: 'Expresión', needsGender: false },
  { value: 'preposicion', label: 'Preposición', needsGender: false },
  { value: 'nacionalidad', label: 'Nacionalidad', needsGender: true },
]

export default function ManageVocab({ customVocab, onChange, onBack }: Props) {
  const [fr, setFr] = useState('')
  const [es, setEs] = useState('')
  const [cat, setCat] = useState<VocabCat>('sustantivo')
  const [gender, setGender] = useState<'m' | 'f'>('m')
  const [error, setError] = useState('')

  const needsGender = CAT_OPTIONS.find((c) => c.value === cat)?.needsGender ?? false

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fr.trim() || !es.trim()) {
      setError('Completa la palabra en francés y su traducción.')
      return
    }
    setError('')
    const entry: Omit<VocabEntry, 'id'> = {
      fr: fr.trim(),
      es: es.trim(),
      cat,
      ...(needsGender ? { gender } : {}),
    }
    onChange(addCustomWord(entry))
    setFr('')
    setEs('')
  }

  function handleRemove(id: string) {
    onChange(removeCustomWord(id))
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-16 pt-8">
      <button onClick={onBack} className="text-sky-400 text-sm mb-4 tap-scale">
        ← Volver
      </button>
      <h1 className="text-xl font-bold mb-1">Mi vocabulario</h1>
      <p className="text-slate-400 text-sm mb-6">
        Agrega tus propias palabras. Aparecerán mezcladas en la categoría que elijas.
      </p>

      <form onSubmit={handleSubmit} className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="fr-input" className="text-xs text-slate-400 mb-1 block">
              Francés
            </label>
            <input
              id="fr-input"
              value={fr}
              onChange={(e) => setFr(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-sky-500"
              placeholder="ex. bibliothèque"
            />
          </div>
          <div>
            <label htmlFor="es-input" className="text-xs text-slate-400 mb-1 block">
              Español
            </label>
            <input
              id="es-input"
              value={es}
              onChange={(e) => setEs(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-sky-500"
              placeholder="ex. biblioteca"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="cat-select" className="text-xs text-slate-400 mb-1 block">
              Categoría
            </label>
            <select
              id="cat-select"
              value={cat}
              onChange={(e) => setCat(e.target.value as VocabCat)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-sky-500"
            >
              {CAT_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          {needsGender && (
            <div>
              <label htmlFor="gender-select" className="text-xs text-slate-400 mb-1 block">
                Género
              </label>
              <select
                id="gender-select"
                value={gender}
                onChange={(e) => setGender(e.target.value as 'm' | 'f')}
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-sky-500"
              >
                <option value="m">Masculino</option>
                <option value="f">Femenino</option>
              </select>
            </div>
          )}
        </div>

        {error && <p className="text-rose-400 text-sm">{error}</p>}

        <button
          type="submit"
          className="tap-scale rounded-lg bg-sky-600 hover:bg-sky-500 px-4 py-2 font-medium self-start"
        >
          + Agregar palabra
        </button>
      </form>

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-slate-300 mb-2">
          Tus palabras ({customVocab.length})
        </h2>
        {customVocab.length === 0 ? (
          <p className="text-slate-500 text-sm">Todavía no agregaste ninguna palabra.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {customVocab.map((w) => (
              <li
                key={w.id}
                className="flex items-center justify-between rounded-lg bg-slate-900/60 border border-slate-800 px-4 py-2"
              >
                <div>
                  <span className="font-medium">{w.fr}</span>
                  <span className="text-slate-500 text-sm"> — {w.es}</span>
                  <span className="text-xs text-slate-600 ml-2">
                    {CAT_OPTIONS.find((c) => c.value === w.cat)?.label ?? w.cat}
                  </span>
                </div>
                <button
                  onClick={() => handleRemove(w.id)}
                  aria-label={`Eliminar ${w.fr}`}
                  className="text-rose-400 text-sm tap-scale"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
