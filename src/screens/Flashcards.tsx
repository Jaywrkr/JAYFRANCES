import { useEffect, useMemo, useState } from 'react'
import { GROUPS } from '../data/categories'
import { buildExampleSentence } from '../data/examples'
import SessionComplete from './SessionComplete'
import { pick } from '../lib/exercises'
import { getState, isMastered, masteryLabel, reviewCard } from '../lib/srs'
import type { SrsStore, VocabEntry } from '../types'

interface Props {
  vocab: VocabEntry[]
  groupId: string
  srs: SrsStore
  onSrsChange: (s: SrsStore, correct: boolean) => void
  onSessionComplete: (correct: number, total: number) => void
  onFinish: () => void
}

const SESSION_SIZE = 15

export default function Flashcards({
  vocab,
  groupId,
  srs,
  onSrsChange,
  onSessionComplete,
  onFinish,
}: Props) {
  const group = GROUPS.find((g) => g.id === groupId)!
  const pool = useMemo(() => vocab.filter((v) => group.cats.includes(v.cat)), [vocab, group])

  const session = useMemo(() => {
    const due = pool.filter((e) => !isMastered(getState(srs, e.id)))
    const source = due.length >= 5 ? due : pool
    return pick(source, Math.min(SESSION_SIZE, source.length))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool])

  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState(0)
  const [finished, setFinished] = useState(false)

  const entry = session[index]

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!flipped) return
      if (e.key === 'ArrowRight') grade(true)
      if (e.key === 'ArrowLeft') grade(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped, index])

  if (finished) {
    return <SessionComplete correct={known} total={session.length} onContinue={onFinish} />
  }

  if (!entry) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-16 text-center">
        <p className="text-slate-300">No hay palabras en esta categoría todavía.</p>
        <button onClick={onFinish} className="mt-4 text-sky-400 tap-scale">
          ← Volver
        </button>
      </div>
    )
  }

  const state = getState(srs, entry.id)
  const example = buildExampleSentence(entry)

  function grade(correct: boolean) {
    onSrsChange(reviewCard(srs, entry.id, correct), correct)
    const finalKnown = known + (correct ? 1 : 0)
    if (correct) setKnown(finalKnown)
    if (index + 1 >= session.length) {
      setFinished(true)
      onSessionComplete(finalKnown, session.length)
      return
    }
    setIndex((i) => i + 1)
    setFlipped(false)
  }

  const progressPct = Math.round((index / session.length) * 100)

  return (
    <div className="max-w-xl mx-auto px-4 pb-16 pt-6">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onFinish} className="text-slate-400 text-sm tap-scale" aria-label="Salir de la sesión">
          ✕ Salir
        </button>
        <div className="text-xs text-slate-400" aria-live="polite">
          {index + 1} / {session.length}
        </div>
      </div>
      <div
        className="h-1.5 rounded-full bg-slate-800 overflow-hidden mb-8"
        role="progressbar"
        aria-valuenow={progressPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progreso de la sesión"
      >
        <div
          className="h-full bg-sky-500 rounded-full transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setFlipped((f) => !f)
          }
        }}
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        aria-label={flipped ? 'Ver palabra en francés' : 'Ver traducción'}
        className="cursor-pointer select-none rounded-2xl bg-slate-900/60 border border-slate-800 p-10 min-h-[220px] flex flex-col items-center justify-center text-center pop focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
        key={entry.id}
      >
        <span className="text-[10px] uppercase tracking-wide text-slate-500 mb-3">
          {masteryLabel(state.repetitions)}
        </span>
        {!flipped ? (
          <h2 className="text-3xl font-bold">{entry.fr}</h2>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-sky-400">{entry.es}</h2>
            <p className="text-slate-500 text-sm mt-3">{entry.fr}</p>
            {example && (
              <p className="text-slate-500 text-xs mt-4 italic">Ejemplo: {example.fr}</p>
            )}
          </>
        )}
        {!flipped && <p className="text-xs text-slate-500 mt-4">Toca para ver la traducción</p>}
      </div>

      {flipped && (
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={() => grade(false)}
            aria-label="No sabía esta palabra"
            className="tap-scale rounded-xl bg-rose-600/20 border border-rose-600/40 text-rose-300 py-3 font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-400"
          >
            😕 No la sabía
          </button>
          <button
            onClick={() => grade(true)}
            aria-label="Sí sabía esta palabra"
            className="tap-scale rounded-xl bg-emerald-600/20 border border-emerald-600/40 text-emerald-300 py-3 font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400"
          >
            😄 La sabía
          </button>
        </div>
      )}

      <div className="mt-4 text-center text-xs text-slate-500">
        Sabidas en esta sesión: {known} / {index + (flipped ? 0 : 0)}
      </div>
      <p className="mt-2 text-center text-[11px] text-slate-600">
        Atajos: Espacio para voltear · ← No la sabía · → La sabía
      </p>
    </div>
  )
}
