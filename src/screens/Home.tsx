import { GROUPS } from '../data/categories'
import { VOCAB } from '../data/vocab'
import { groupMastery } from '../lib/progress'
import type { SrsStore } from '../types'

interface Props {
  srs: SrsStore
  onSelectGroup: (groupId: string) => void
}

export default function Home({ srs, onSelectGroup }: Props) {
  const totalWords = VOCAB.length
  const overallEntries = VOCAB
  const overallMastery = groupMastery(srs, overallEntries)

  return (
    <div className="max-w-3xl mx-auto px-4 pb-16 pt-8">
      <header className="mb-8 text-center">
        <div className="text-4xl mb-2">🇫🇷🎓</div>
        <h1 className="text-2xl font-bold tracking-tight">Repaso de Francés</h1>
        <p className="text-slate-400 mt-1 text-sm">
          {totalWords} palabras que ya aprendiste, organizadas por categoría gramatical
        </p>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {GROUPS.map((g) => {
          const entries = VOCAB.filter((v) => g.cats.includes(v.cat))
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
