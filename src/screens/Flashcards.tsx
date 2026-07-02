import { useMemo, useState } from 'react'
import { GROUPS } from '../data/categories'
import { VOCAB } from '../data/vocab'
import { pick } from '../lib/exercises'
import { getState, masteryLabel, reviewCard } from '../lib/srs'
import type { SrsStore } from '../types'

interface Props {
  groupId: string
  srs: SrsStore
  onSrsChange: (s: SrsStore) => void
  onFinish: () => void
}

const SESSION_SIZE = 15

export default function Flashcards({ groupId, srs, onSrsChange, onFinish }: Props) {
  const group = GROUPS.find((g) => g.id === groupId)!
  const pool = useMemo(() => VOCAB.filter((v) => group.cats.includes(v.cat)), [group])

  const session = useMemo(() => {
    const due = pool.filter((e) => getState(srs, e.id).box < 5)
    const source = due.length >= 5 ? due : pool
    return pick(source, Math.min(SESSION_SIZE, source.length))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool])

  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState(0)

  const entry = session[index]

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

  function grade(correct: boolean) {
    onSrsChange(reviewCard(srs, entry.id, correct))
    if (correct) setKnown((k) => k + 1)
    if (index + 1 >= session.length) {
      onFinish()
      return
    }
    setIndex((i) => i + 1)
    setFlipped(false)
  }

  const progressPct = Math.round((index / session.length) * 100)

  return (
    <div className="max-w-xl mx-auto px-4 pb-16 pt-6">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onFinish} className="text-slate-400 text-sm tap-scale">
          ✕ Salir
        </button>
        <div className="text-xs text-slate-400">
          {index + 1} / {session.length}
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden mb-8">
        <div
          className="h-full bg-sky-500 rounded-full transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div
        onClick={() => setFlipped((f) => !f)}
        className="cursor-pointer select-none rounded-2xl bg-slate-900/60 border border-slate-800 p-10 min-h-[220px] flex flex-col items-center justify-center text-center pop"
        key={entry.id}
      >
        <span className="text-[10px] uppercase tracking-wide text-slate-500 mb-3">
          {masteryLabel(state.box)}
        </span>
        {!flipped ? (
          <h2 className="text-3xl font-bold">{entry.fr}</h2>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-sky-400">{entry.es}</h2>
            <p className="text-slate-500 text-sm mt-3">{entry.fr}</p>
          </>
        )}
        {!flipped && <p className="text-xs text-slate-500 mt-4">Toca para ver la traducción</p>}
      </div>

      {flipped && (
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={() => grade(false)}
            className="tap-scale rounded-xl bg-rose-600/20 border border-rose-600/40 text-rose-300 py-3 font-medium"
          >
            😕 No la sabía
          </button>
          <button
            onClick={() => grade(true)}
            className="tap-scale rounded-xl bg-emerald-600/20 border border-emerald-600/40 text-emerald-300 py-3 font-medium"
          >
            😄 La sabía
          </button>
        </div>
      )}

      <div className="mt-4 text-center text-xs text-slate-500">
        Sabidas en esta sesión: {known} / {index + (flipped ? 0 : 0)}
      </div>
    </div>
  )
}
