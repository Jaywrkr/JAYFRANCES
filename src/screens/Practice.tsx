import { useEffect, useMemo, useState } from 'react'
import { GROUPS } from '../data/categories'
import { generateConjugationEntries, TENSE_LABEL, type Tense } from '../data/conjugations'
import { buildExampleSentence } from '../data/examples'
import SessionComplete from './SessionComplete'
import {
  buildCompletarQuestion,
  buildConjugationQuestion,
  buildGenderQuestion,
  buildMultipleChoice,
  isGenderable,
  normalize,
  pick,
} from '../lib/exercises'
import { getState, isMastered, reviewCard } from '../lib/srs'
import type { ExerciseType, SrsStore, VocabEntry } from '../types'

interface Props {
  vocab: VocabEntry[]
  groupId: string
  exerciseType: ExerciseType
  srs: SrsStore
  onSrsChange: (s: SrsStore) => void
  onFinish: () => void
}

const SESSION_SIZE = 10

function selectSessionEntries(
  pool: VocabEntry[],
  srs: SrsStore,
  exerciseType: ExerciseType
): VocabEntry[] {
  let candidates = pool
  if (exerciseType === 'genero') candidates = pool.filter(isGenderable)
  if (exerciseType === 'conjugacion') candidates = pool.filter((e) => e.cat === 'verbo_conjugado')

  const due = candidates.filter((e) => !isMastered(getState(srs, e.id)))
  const source = due.length >= 4 ? due : candidates
  return pick(source, Math.min(SESSION_SIZE, source.length))
}

const EXTRA_TENSE_ENTRIES = generateConjugationEntries()

export default function Practice({ vocab, groupId, exerciseType, srs, onSrsChange, onFinish }: Props) {
  const group = GROUPS.find((g) => g.id === groupId)!
  const pool = useMemo(() => {
    const base = vocab.filter((v) => group.cats.includes(v.cat))
    if (exerciseType !== 'conjugacion' || !group.cats.includes('verbo_conjugado')) return base
    return [...base, ...EXTRA_TENSE_ENTRIES]
  }, [vocab, group, exerciseType])
  const [directionSeed] = useState(() => Math.random())

  const session = useMemo(
    () => selectSessionEntries(pool, srs, exerciseType),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pool, exerciseType]
  )

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [textAnswer, setTextAnswer] = useState('')
  const [checked, setChecked] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const [shake, setShake] = useState(false)

  const entry = session[index]
  const direction = (index + (directionSeed > 0.5 ? 1 : 0)) % 2 === 0 ? 'fr2es' : 'es2fr'

  const question = useMemo(() => {
    if (!entry) return null
    if (exerciseType === 'opcion_multiple') return buildMultipleChoice(entry, pool, direction)
    if (exerciseType === 'genero') return buildGenderQuestion(entry)
    if (exerciseType === 'conjugacion') return buildConjugationQuestion(entry, pool)
    return buildCompletarQuestion(entry)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.id, exerciseType])

  const example = useMemo(() => (entry ? buildExampleSentence(entry) : null), [entry])

  useEffect(() => {
    // El input de "completar" maneja su propio Enter (comprobar/siguiente);
    // aquí solo cubrimos los ejercicios de opciones para no disparar doble.
    if (!question || question.kind === 'completar') return
    function onKeyDown(e: KeyboardEvent) {
      if (checked) {
        if (e.key === 'Enter') next()
        return
      }
      if (question!.kind === 'mc' || question!.kind === 'conj') {
        const n = Number(e.key)
        const opts = (question as { options: string[] }).options
        if (n >= 1 && n <= opts.length) handleAnswer(opts[n - 1])
      } else if (question!.kind === 'gender') {
        if (e.key.toLowerCase() === 'm') handleAnswer('m')
        if (e.key.toLowerCase() === 'f') handleAnswer('f')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked, question])

  if (finished) {
    return <SessionComplete correct={correctCount} total={session.length} onContinue={onFinish} />
  }

  if (!entry || !question) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-16 text-center">
        <p className="text-slate-300">No hay suficientes palabras en esta categoría todavía.</p>
        <button onClick={onFinish} className="mt-4 text-sky-400 tap-scale">
          ← Volver
        </button>
      </div>
    )
  }

  function isCorrect(): boolean {
    const q = question!
    if (q.kind === 'mc') return selected === q.answer
    if (q.kind === 'gender') return selected === q.answer
    if (q.kind === 'conj') return selected === q.answer
    if (q.kind === 'completar') return normalize(textAnswer) === normalize(q.answer)
    return false
  }

  function handleAnswer(choice: string | null) {
    if (checked) return
    if (choice !== null) setSelected(choice)
    setChecked(true)
    const q = question!
    const correct =
      q.kind === 'completar'
        ? normalize(textAnswer) === normalize(q.answer)
        : choice === (q as { answer: string }).answer
    if (correct) {
      setCorrectCount((c) => c + 1)
    } else {
      setShake(true)
      setTimeout(() => setShake(false), 400)
    }
    onSrsChange(reviewCard(srs, entry.id, correct))
  }

  function next() {
    if (index + 1 >= session.length) {
      setFinished(true)
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
    setTextAnswer('')
    setChecked(false)
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
        key={entry.id}
        className={`pop rounded-2xl bg-slate-900/60 border border-slate-800 p-6 ${shake ? 'shake' : ''}`}
      >
        {question.kind === 'mc' && (
          <>
            <p className="text-xs text-slate-400 mb-2">{question.promptLabel}</p>
            <h2 className="text-2xl font-semibold mb-6">{question.prompt}</h2>
            <div className="grid gap-2">
              {question.options.map((opt) => (
                <OptionButton
                  key={opt}
                  label={opt}
                  selected={selected === opt}
                  checked={checked}
                  isAnswer={opt === question.answer}
                  onClick={() => handleAnswer(opt)}
                />
              ))}
            </div>
          </>
        )}

        {question.kind === 'gender' && (
          <>
            <p className="text-xs text-slate-400 mb-2">¿Masculino o femenino? ({question.hintEs})</p>
            <h2 className="text-3xl font-bold mb-6 text-center">{question.word}</h2>
            <div className="grid grid-cols-2 gap-3">
              <OptionButton
                label="🔵 Masculino (le / un)"
                selected={selected === 'm'}
                checked={checked}
                isAnswer={question.answer === 'm'}
                onClick={() => handleAnswer('m')}
              />
              <OptionButton
                label="🔴 Femenino (la / une)"
                selected={selected === 'f'}
                checked={checked}
                isAnswer={question.answer === 'f'}
                onClick={() => handleAnswer('f')}
              />
            </div>
          </>
        )}

        {question.kind === 'conj' && (
          <>
            <p className="text-xs text-slate-400 mb-2">
              Verbo <span className="text-sky-400">{question.infinitivo}</span> — persona:{' '}
              <span className="text-sky-400">{question.persona}</span>
              {question.tense && question.tense !== 'presente' && (
                <>
                  {' '}
                  — tiempo: <span className="text-amber-400">{TENSE_LABEL[question.tense as Tense]}</span>
                </>
              )}
            </p>
            <h2 className="text-lg font-semibold mb-6">
              ¿Cuál es la forma correcta de "{question.infinitivo}" para "{question.persona}"?
            </h2>
            <div className="grid gap-2">
              {question.options.map((opt) => (
                <OptionButton
                  key={opt}
                  label={opt}
                  selected={selected === opt}
                  checked={checked}
                  isAnswer={opt === question.answer}
                  onClick={() => handleAnswer(opt)}
                />
              ))}
            </div>
          </>
        )}

        {question.kind === 'completar' && (
          <>
            <label htmlFor="completar-input" className="text-xs text-slate-400 mb-2 block">
              Escribe en francés:
            </label>
            <h2 className="text-2xl font-semibold mb-6">{question.hintEs}</h2>
            <input
              id="completar-input"
              autoFocus
              disabled={checked}
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (!checked) handleAnswer(null)
                  else next()
                }
              }}
              placeholder="tu respuesta..."
              aria-label="Tu respuesta en francés"
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-lg outline-none focus:border-sky-500"
            />
            {checked && (
              <p role="status" className={`mt-3 text-sm ${isCorrect() ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isCorrect() ? '¡Correcto!' : `Respuesta correcta: ${question.answer}`}
              </p>
            )}
          </>
        )}

        {checked && question.kind !== 'completar' && (
          <p role="status" className={`mt-4 text-sm ${isCorrect() ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isCorrect()
              ? '¡Correcto!'
              : `Respuesta correcta: ${
                  question.kind === 'gender'
                    ? question.answer === 'm'
                      ? 'Masculino (le / un)'
                      : 'Femenino (la / une)'
                    : (question as { answer: string }).answer
                }`}
          </p>
        )}

        {entry.es.split(',').length > 1 && checked && (
          <p className="mt-2 text-xs text-slate-500">Otros significados: {entry.es}</p>
        )}

        {checked && example && (
          <p className="mt-2 text-xs text-slate-500">
            Ejemplo: <span className="italic text-slate-400">{example.fr}</span>
          </p>
        )}

        <div className="mt-6 flex justify-end">
          {!checked && question.kind === 'completar' ? (
            <button
              onClick={() => handleAnswer(null)}
              className="tap-scale rounded-lg bg-sky-600 hover:bg-sky-500 px-5 py-2 font-medium"
            >
              Comprobar
            </button>
          ) : checked ? (
            <button
              onClick={next}
              className="tap-scale rounded-lg bg-sky-600 hover:bg-sky-500 px-5 py-2 font-medium"
            >
              {index + 1 >= session.length ? 'Terminar' : 'Siguiente →'}
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 text-center text-xs text-slate-500">
        Aciertos en esta sesión: {correctCount} / {index + (checked ? 1 : 0)}
      </div>
      {question.kind !== 'completar' && (
        <p className="mt-2 text-center text-[11px] text-slate-600">
          Atajos: {question.kind === 'gender' ? 'M / F' : `1-${question.options.length}`} para elegir · Enter para continuar
        </p>
      )}
    </div>
  )
}

function OptionButton({
  label,
  selected,
  checked,
  isAnswer,
  onClick,
}: {
  label: string
  selected: boolean
  checked: boolean
  isAnswer: boolean
  onClick: () => void
}) {
  let cls = 'border-slate-700 bg-slate-800/60 hover:border-sky-600'
  if (checked) {
    if (isAnswer) cls = 'border-emerald-500 bg-emerald-500/15'
    else if (selected) cls = 'border-rose-500 bg-rose-500/15'
    else cls = 'border-slate-800 bg-slate-800/30 opacity-60'
  } else if (selected) {
    cls = 'border-sky-500 bg-sky-500/10'
  }
  return (
    <button
      disabled={checked}
      onClick={onClick}
      aria-pressed={selected}
      className={`tap-scale text-left rounded-lg border px-4 py-3 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 ${cls}`}
    >
      {label}
    </button>
  )
}
