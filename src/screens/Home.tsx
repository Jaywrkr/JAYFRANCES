import { GROUPS } from '../data/categories'
import { groupMastery } from '../lib/progress'
import { isDue } from '../lib/srs'
import type { Theme } from '../lib/theme'
import type { SrsStore, VocabEntry } from '../types'

interface Props {
  vocab: VocabEntry[]
  srs: SrsStore
  theme: Theme
  onToggleTheme: () => void
  onSelectGroup: (groupId: string) => void
  onManageVocab: () => void
  onShowStats: () => void
}

export default function Home({
  vocab,
  srs,
  theme,
  onToggleTheme,
  onSelectGroup,
  onManageVocab,
  onShowStats,
}: Props) {
  const totalWords = vocab.length
  const overallEntries = vocab
  const overallMastery = groupMastery(srs, overallEntries)
  const dueCount = vocab.filter((v) => isDue(srs, v.id)).length

  return (
    <div className="max-w-3xl mx-auto px-4 pb-16 pt-8">
      <div className="flex justify-end mb-2">
        <button
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          className="tap-scale text-lg rounded-full border border-slate-700 w-9 h-9 flex items-center justify-center hover:border-sky-600/60"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <header className="mb-8 text-center">
        <div className="text-4xl mb-2">🇫🇷🎓</div>
        <h1 className="text-2xl font-bold tracking-tight">Repaso de Francés</h1>
        <p className="text-slate-400 mt-1 text-sm">
          {totalWords} palabras que ya aprendiste, organizadas por categoría gramatical
        </p>
        {dueCount > 0 && (
          <p className="text-amber-400 text-sm mt-2 font-medium">
            📌 {dueCount} {dueCount === 1 ? 'palabra lista' : 'palabras listas'} para repasar hoy
          </p>
        )}
        <div className="mt-4 mx-auto max-w-xs">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Dominio general</span>
            <span>{overallMastery}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full transition-all"
              style={{ width: `${overallMastery}%` }}
            />
          </div>
        </div>
      </header>

      <div className="flex justify-center gap-2 mb-4 flex-wrap">
        <button
          onClick={onManageVocab}
          className="tap-scale text-xs rounded-full border border-slate-700 px-4 py-1.5 text-slate-300 hover:border-sky-600/60"
        >
          + Mi vocabulario
        </button>
        <button
          onClick={onShowStats}
          className="tap-scale text-xs rounded-full border border-slate-700 px-4 py-1.5 text-slate-300 hover:border-sky-600/60"
        >
          📊 Estadísticas
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {GROUPS.map((g) => {
          const entries = vocab.filter((v) => g.cats.includes(v.cat))
          const mastery = groupMastery(srs, entries)
          return (
            <button
              key={g.id}
              onClick={() => onSelectGroup(g.id)}
              className="tap-scale text-left rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-sky-600/60 hover:bg-slate-900 p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{g.emoji}</span>
                <span className="text-xs text-slate-500">{entries.length} palabras</span>
              </div>
              <div>
                <h2 className="font-semibold text-slate-100">{g.label}</h2>
                <p className="text-xs text-slate-400 mt-0.5 leading-snug">{g.desc}</p>
              </div>
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  style={{ width: `${mastery}%` }}
                />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
