import { getWeakSpots } from '../lib/weakSpots'
import SpeakButton from './SpeakButton'
import type { ExerciseType, SrsStore, VocabEntry } from '../types'

interface Props {
  vocab: VocabEntry[]
  srs: SrsStore
  onBack: () => void
  onStart: (entries: VocabEntry[], exerciseType: ExerciseType) => void
}

export default function WeakSpots({ vocab, srs, onBack, onStart }: Props) {
  const weak = getWeakSpots(vocab, srs)
  const entries = weak.map((w) => w.entry)

  return (
    <div className="max-w-2xl mx-auto px-4 pb-16 pt-8">
      <button onClick={onBack} className="text-sky-400 text-sm mb-4 tap-scale">
        ← Volver
      </button>
      <h1 className="text-xl font-bold mb-1">🎯 Palabras difíciles</h1>
      <p className="text-slate-400 text-sm mb-6">
        Las palabras donde más fallas, sin importar la categoría — algo que Duolingo no te muestra.
        Se calculan con tu porcentaje real de aciertos (mínimo 2 intentos).
      </p>

      {entries.length === 0 ? (
        <p className="text-slate-500 text-sm">
          Todavía no hay suficientes datos. Practica un poco más y vuelve aquí — en cuanto falles
          alguna palabra dos o más veces, aparecerá para que la refuerces.
        </p>
      ) : (
        <>
          <div className="flex gap-2 mb-6 flex-wrap">
            <button
              onClick={() => onStart(entries, 'flashcards')}
              className="tap-scale rounded-lg bg-sky-600 hover:bg-sky-500 px-4 py-2 font-medium"
            >
              🗂️ Repasar con Flashcards
            </button>
            <button
              onClick={() => onStart(entries, 'opcion_multiple')}
              className="tap-scale rounded-lg border border-slate-700 hover:border-sky-600/60 px-4 py-2 font-medium"
            >
              ✅ Repasar con Opción múltiple
            </button>
          </div>

          <ul className="flex flex-col gap-2">
            {weak.map((w) => (
              <li
                key={w.entry.id}
                className="flex items-center justify-between rounded-lg bg-slate-900/60 border border-slate-800 px-4 py-2 text-sm"
              >
                <div className="flex items-center gap-1">
                  <span className="font-medium text-slate-100">{w.entry.fr}</span>
                  <SpeakButton text={w.entry.fr} className="w-6 h-6 text-sm" />
                  <span className="text-slate-500"> — {w.entry.es.split(',')[0].trim()}</span>
                </div>
                <span className={w.accuracy < 0.4 ? 'text-rose-400' : 'text-amber-400'}>
                  {Math.round(w.accuracy * 100)}% aciertos
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
