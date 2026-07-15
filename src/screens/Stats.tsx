import { GROUPS } from '../data/categories'
import { groupMastery } from '../lib/progress'
import { getState, isDue } from '../lib/srs'
import { getAchievements } from '../lib/achievements'
import { getWeeklyComparison } from '../lib/activityLog'
import type { StreakData } from '../lib/streak'
import type { SrsStore, VocabEntry } from '../types'

interface Props {
  vocab: VocabEntry[]
  srs: SrsStore
  streak: StreakData
  customVocabCount: number
  onBack: () => void
}

export default function Stats({ vocab, srs, streak, customVocabCount, onBack }: Props) {
  const overallMastery = groupMastery(srs, vocab)
  const dueCount = vocab.filter((v) => isDue(srs, v.id)).length
  const achievements = getAchievements(vocab, srs, streak, customVocabCount)
  const weekly = getWeeklyComparison()

  let totalSeen = 0
  let totalCorrect = 0
  for (const v of vocab) {
    const s = getState(srs, v.id)
    totalSeen += s.seen
    totalCorrect += s.correct
  }
  const accuracy = totalSeen === 0 ? null : Math.round((totalCorrect / totalSeen) * 100)

  return (
    <div className="max-w-2xl mx-auto px-4 pb-16 pt-8">
      <button onClick={onBack} className="text-sky-400 text-sm mb-4 tap-scale">
        ← Volver
      </button>
      <h1 className="text-xl font-bold mb-6">Estadísticas</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatTile label="Dominio general" value={`${overallMastery}%`} />
        <StatTile label="Para repasar hoy" value={String(dueCount)} />
        <StatTile label="Precisión" value={accuracy === null ? '—' : `${accuracy}%`} />
        <StatTile label="Racha actual" value={`🔥 ${streak.currentStreak}`} />
      </div>

      <h2 className="text-sm font-semibold text-slate-300 mb-3">Esta semana vs. la anterior</h2>
      <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 mb-8">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-300">
            Esta semana: <span className="font-semibold text-slate-100">{weekly.thisWeek}</span> repasos
          </span>
          <span className="text-slate-400">
            Semana pasada: {weekly.lastWeek}
          </span>
        </div>
        <div className="flex gap-2 items-end h-16">
          <div className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-sky-500 rounded-t"
              style={{ height: `${barHeight(weekly.thisWeek, weekly.lastWeek)}%` }}
            />
            <span className="text-[10px] text-slate-500">Esta semana</span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-slate-600 rounded-t"
              style={{ height: `${barHeight(weekly.lastWeek, weekly.thisWeek)}%` }}
            />
            <span className="text-[10px] text-slate-500">Semana pasada</span>
          </div>
        </div>
      </div>

      <h2 className="text-sm font-semibold text-slate-300 mb-3">Logros</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-8">
        {achievements.map((a) => (
          <div
            key={a.id}
            className={`rounded-xl border p-3 text-center ${
              a.achieved
                ? 'border-emerald-600/40 bg-emerald-600/10'
                : 'border-slate-800 bg-slate-900/40 opacity-50'
            }`}
          >
            <div className="text-2xl mb-1">{a.emoji}</div>
            <div className="text-xs font-medium text-slate-100">{a.label}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{a.description}</div>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-semibold text-slate-300 mb-3">Por categoría</h2>
      <div className="flex flex-col gap-2">
        {GROUPS.map((g) => {
          const entries = vocab.filter((v) => g.cats.includes(v.cat))
          const mastery = groupMastery(srs, entries)
          const due = entries.filter((e) => isDue(srs, e.id)).length
          return (
            <div key={g.id} className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span>{g.emoji}</span>
                  <span className="font-medium text-slate-100">{g.label}</span>
                </div>
                <span className="text-xs text-slate-400">
                  {mastery}% · {due} para repasar
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  style={{ width: `${mastery}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function barHeight(value: number, other: number): number {
  const max = Math.max(value, other, 1)
  return Math.max(6, Math.round((value / max) * 100))
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 text-center">
      <div className="text-2xl font-bold text-sky-400">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  )
}
