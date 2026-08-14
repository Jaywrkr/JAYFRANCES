import { useMemo, useState } from 'react'
import { GROUPS } from '../data/categories'
import {
  applyCoopResult,
  buildDuelQuestions,
  duelWinner,
  DUEL_MIN_POOL,
  DUEL_ROUNDS,
  DUEL_START_LIVES,
  type DuelMode,
} from '../lib/duel'
import type { VocabEntry } from '../types'

interface Props {
  vocab: VocabEntry[]
  onBack: () => void
}

const CONFETTI = ['🎉', '✨', '🎊', '⭐️', '💫']
const PLAYER_STYLE = [
  { color: 'sky', defaultName: 'Piloto ✈️', ring: 'border-sky-500 bg-sky-500/10 text-sky-300' },
  { color: 'amber', defaultName: 'Copiloto 🧑‍🚀', ring: 'border-amber-500 bg-amber-500/10 text-amber-300' },
] as const

export default function Duel({ vocab, onBack }: Props) {
  const [groupId, setGroupId] = useState<string | null>(null)
  const [mode, setMode] = useState<DuelMode>('competitivo')
  const [names, setNames] = useState<[string, string]>([PLAYER_STYLE[0].defaultName, PLAYER_STYLE[1].defaultName])

  const groupsWithEnoughWords = useMemo(
    () =>
      GROUPS.map((g) => ({ group: g, count: vocab.filter((v) => g.cats.includes(v.cat)).length })).filter(
        (g) => g.count >= DUEL_MIN_POOL
      ),
    [vocab]
  )

  if (!groupId) {
    return (
      <div className="max-w-xl mx-auto px-4 pb-16 pt-8">
        <button onClick={onBack} className="text-sky-400 text-sm mb-4 tap-scale">
          ← Volver
        </button>
        <header className="mb-6 text-center">
          <div className="text-4xl mb-2">🎮✈️</div>
          <h1 className="text-2xl font-bold">Duelo de Copilotos</h1>
          <p className="text-slate-400 text-sm mt-1">
            Un juego para dos — se van pasando el teléfono por turnos
          </p>
        </header>

        <div className="mb-6">
          <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">Nombres</p>
          <div className="grid grid-cols-2 gap-3">
            {PLAYER_STYLE.map((_, i) => (
              <input
                key={i}
                value={names[i]}
                onChange={(e) =>
                  setNames((n) => (i === 0 ? [e.target.value, n[1]] : [n[0], e.target.value]))
                }
                aria-label={`Nombre del jugador ${i + 1}`}
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-sky-500"
              />
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">Modo de juego</p>
          <div className="grid gap-3">
            <button
              onClick={() => setMode('competitivo')}
              className={`tap-scale text-left rounded-xl border p-4 ${
                mode === 'competitivo' ? 'border-sky-500 bg-sky-500/10' : 'border-slate-800 bg-slate-900/60'
              }`}
            >
              <div className="font-semibold">⚔️ Competitivo</div>
              <p className="text-xs text-slate-400 mt-1">
                Cada uno suma puntos por sus aciertos — gana quien tenga más al final
              </p>
            </button>
            <button
              onClick={() => setMode('cooperativo')}
              className={`tap-scale text-left rounded-xl border p-4 ${
                mode === 'cooperativo' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 bg-slate-900/60'
              }`}
            >
              <div className="font-semibold">🤝 Cooperativo</div>
              <p className="text-xs text-slate-400 mt-1">
                Comparten {DUEL_START_LIVES} vidas — ¡completen la misión juntos antes de perderlas!
              </p>
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">Categoría</p>
          {groupsWithEnoughWords.length === 0 ? (
            <p className="text-sm text-slate-400">
              Todavía no hay suficientes palabras en ninguna categoría para jugar (se necesitan al menos{' '}
              {DUEL_MIN_POOL}).
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {groupsWithEnoughWords.map(({ group, count }) => (
                <button
                  key={group.id}
                  onClick={() => setGroupId(group.id)}
                  className="tap-scale text-left rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-600/60 p-3"
                >
                  <div className="text-xl">{group.emoji}</div>
                  <div className="text-sm font-medium">{group.label}</div>
                  <div className="text-[11px] text-slate-500">{count} palabras</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <DuelGame
      vocab={vocab}
      groupId={groupId}
      mode={mode}
      names={names}
      onBack={() => setGroupId(null)}
      onExit={onBack}
    />
  )
}

function DuelGame({
  vocab,
  groupId,
  mode,
  names,
  onBack,
  onExit,
}: {
  vocab: VocabEntry[]
  groupId: string
  mode: DuelMode
  names: [string, string]
  onBack: () => void
  onExit: () => void
}) {
  const group = GROUPS.find((g) => g.id === groupId)!
  const pool = useMemo(() => vocab.filter((v) => group.cats.includes(v.cat)), [vocab, group])
  const [questions] = useState(() => buildDuelQuestions(pool, DUEL_ROUNDS))

  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [scores, setScores] = useState<[number, number]>([0, 0])
  const [coopScore, setCoopScore] = useState(0)
  const [lives, setLives] = useState(DUEL_START_LIVES)
  const [ended, setEnded] = useState(false)

  const question = questions[index]
  const player = PLAYER_STYLE[question?.playerIndex ?? 0]
  const isCorrect = selected === question?.answer

  function handleAnswer(choice: string) {
    if (checked) return
    setSelected(choice)
    setChecked(true)
    const correct = choice === question.answer
    if (mode === 'competitivo') {
      if (correct) setScores((s) => (question.playerIndex === 0 ? [s[0] + 1, s[1]] : [s[0], s[1] + 1]))
    } else {
      if (correct) setCoopScore((c) => c + 1)
      setLives((l) => applyCoopResult(l, correct))
    }
  }

  function next() {
    const outOfLives = mode === 'cooperativo' && lives <= 0
    if (index + 1 >= questions.length || outOfLives) {
      setEnded(true)
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
    setChecked(false)
    setRevealed(false)
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-16 text-center">
        <p className="text-slate-300">No hay suficientes palabras en esta categoría todavía.</p>
        <button onClick={onBack} className="mt-4 text-sky-400 tap-scale">
          ← Elegir otra categoría
        </button>
      </div>
    )
  }

  if (ended) {
    const winner = mode === 'competitivo' ? duelWinner(scores) : null
    const coopSuccess = mode === 'cooperativo' && lives > 0
    const celebrate = mode === 'competitivo' || coopSuccess

    return (
      <div className="max-w-xl mx-auto px-4 pt-16 text-center relative overflow-hidden">
        {celebrate && (
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            {Array.from({ length: 18 }).map((_, i) => (
              <span
                key={i}
                className="confetti-piece"
                style={{ left: `${(i * 53) % 100}%`, animationDelay: `${(i % 6) * 0.15}s` }}
              >
                {CONFETTI[i % CONFETTI.length]}
              </span>
            ))}
          </div>
        )}
        <div className="text-5xl mb-4">{celebrate ? '🏆' : '💥'}</div>
        <h1 className="text-2xl font-bold mb-4">
          {mode === 'competitivo'
            ? winner === 'tie'
              ? '¡Empate!'
              : `¡Ganó ${names[winner as 0 | 1]}!`
            : coopSuccess
              ? '¡Misión cumplida en equipo!'
              : '¡Se acabaron las vidas!'}
        </h1>

        {mode === 'competitivo' ? (
          <div className="flex justify-center gap-6 mb-8">
            <ScoreCard name={names[0]} score={scores[0]} style={PLAYER_STYLE[0]} />
            <ScoreCard name={names[1]} score={scores[1]} style={PLAYER_STYLE[1]} />
          </div>
        ) : (
          <p className="text-slate-300 mb-8">
            Entre los dos acertaron <span className="font-semibold text-emerald-400">{coopScore}</span> palabras
          </p>
        )}

        <div className="flex justify-center gap-3">
          <button onClick={onBack} className="tap-scale rounded-lg border border-slate-700 px-5 py-2.5 font-medium">
            Otra ronda
          </button>
          <button
            onClick={onExit}
            className="tap-scale rounded-lg bg-sky-600 hover:bg-sky-500 px-5 py-2.5 font-medium"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  if (!revealed) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-16 text-center">
        <button onClick={onExit} className="text-slate-400 text-sm tap-scale mb-8" aria-label="Salir del duelo">
          ✕ Salir
        </button>
        <div className="text-5xl mb-4">📱</div>
        <p className="text-slate-400 text-sm mb-2">Pásale el teléfono a</p>
        <h1 className={`text-3xl font-bold mb-8 ${player.color === 'sky' ? 'text-sky-400' : 'text-amber-400'}`}>
          {names[question.playerIndex]}
        </h1>
        <button
          onClick={() => setRevealed(true)}
          className="tap-scale rounded-lg bg-sky-600 hover:bg-sky-500 px-8 py-3 font-medium"
        >
          Listo, ¡mostrar pregunta!
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 pb-16 pt-6">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onExit} className="text-slate-400 text-sm tap-scale" aria-label="Salir del duelo">
          ✕ Salir
        </button>
        <div className="text-xs text-slate-400">
          {index + 1} / {questions.length}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 text-sm">
        {mode === 'competitivo' ? (
          <>
            <span className={`font-medium ${scores[0] >= scores[1] ? 'text-sky-400' : 'text-slate-500'}`}>
              {names[0]}: {scores[0]}
            </span>
            <span className={`font-medium ${scores[1] >= scores[0] ? 'text-amber-400' : 'text-slate-500'}`}>
              {names[1]}: {scores[1]}
            </span>
          </>
        ) : (
          <>
            <span className="font-medium text-emerald-400">Equipo: {coopScore} aciertos</span>
            <span aria-label={`${lives} vidas restantes`}>{'❤️'.repeat(lives)}{'🖤'.repeat(DUEL_START_LIVES - lives)}</span>
          </>
        )}
      </div>

      <div className={`pop rounded-2xl border-2 p-6 ${player.ring}`}>
        <p className="text-xs mb-1 font-medium">Turno de {names[question.playerIndex]}</p>
        <p className="text-xs text-slate-400 mb-2">{question.promptLabel}</p>
        <h2 className="text-2xl font-semibold mb-6">{question.prompt}</h2>
        <div className="grid gap-2">
          {question.options.map((opt) => {
            let cls = 'border-slate-700 bg-slate-800/60 hover:border-sky-600'
            if (checked) {
              if (opt === question.answer) cls = 'border-emerald-500 bg-emerald-500/15'
              else if (opt === selected) cls = 'border-rose-500 bg-rose-500/15'
              else cls = 'border-slate-800 bg-slate-800/30 opacity-60'
            } else if (opt === selected) {
              cls = 'border-sky-500 bg-sky-500/10'
            }
            return (
              <button
                key={opt}
                disabled={checked}
                onClick={() => handleAnswer(opt)}
                className={`tap-scale text-left rounded-lg border px-4 py-3 transition-colors ${cls}`}
              >
                {opt}
              </button>
            )
          })}
        </div>

        {checked && (
          <p role="status" className={`mt-4 text-sm ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isCorrect ? '¡Correcto!' : `Respuesta correcta: ${question.answer}`}
          </p>
        )}

        <div className="mt-6 flex justify-end">
          {checked && (
            <button
              onClick={next}
              className="tap-scale rounded-lg bg-sky-600 hover:bg-sky-500 px-5 py-2 font-medium"
            >
              {index + 1 >= questions.length ? 'Terminar' : 'Siguiente turno →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ScoreCard({
  name,
  score,
  style,
}: {
  name: string
  score: number
  style: (typeof PLAYER_STYLE)[number]
}) {
  return (
    <div className={`rounded-xl border px-6 py-4 ${style.color === 'sky' ? 'border-sky-500 bg-sky-500/10' : 'border-amber-500 bg-amber-500/10'}`}>
      <div className="text-sm text-slate-300">{name}</div>
      <div className="text-3xl font-bold">{score}</div>
    </div>
  )
}
