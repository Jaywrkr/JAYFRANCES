import { useEffect, useMemo, useState } from 'react'
import Home from './screens/Home'
import ExercisePicker from './screens/ExercisePicker'
import Practice from './screens/Practice'
import Flashcards from './screens/Flashcards'
import ManageVocab from './screens/ManageVocab'
import { loadSrs } from './lib/srs'
import { loadCustomVocab } from './lib/customVocab'
import { VOCAB } from './data/vocab'
import type { ExerciseType, SrsStore, VocabEntry } from './types'

type View =
  | { name: 'home' }
  | { name: 'picker'; groupId: string }
  | { name: 'session'; groupId: string; exercise: ExerciseType }
  | { name: 'manageVocab' }

export default function App() {
  const [srs, setSrs] = useState<SrsStore>({})
  const [customVocab, setCustomVocab] = useState<VocabEntry[]>([])
  const [view, setView] = useState<View>({ name: 'home' })

  useEffect(() => {
    setSrs(loadSrs())
    setCustomVocab(loadCustomVocab())
  }, [])

  const vocab = useMemo(() => [...VOCAB, ...customVocab], [customVocab])

  return (
    <div className="min-h-screen">
      {view.name === 'home' && (
        <Home
          vocab={vocab}
          srs={srs}
          onSelectGroup={(groupId) => setView({ name: 'picker', groupId })}
          onManageVocab={() => setView({ name: 'manageVocab' })}
        />
      )}

      {view.name === 'manageVocab' && (
        <ManageVocab
          customVocab={customVocab}
          onChange={setCustomVocab}
          onBack={() => setView({ name: 'home' })}
        />
      )}

      {view.name === 'picker' && (
        <ExercisePicker
          vocab={vocab}
          groupId={view.groupId}
          onBack={() => setView({ name: 'home' })}
          onStart={(exercise) => setView({ name: 'session', groupId: view.groupId, exercise })}
        />
      )}

      {view.name === 'session' && view.exercise === 'flashcards' && (
        <Flashcards
          vocab={vocab}
          groupId={view.groupId}
          srs={srs}
          onSrsChange={setSrs}
          onFinish={() => setView({ name: 'picker', groupId: view.groupId })}
        />
      )}

      {view.name === 'session' && view.exercise !== 'flashcards' && (
        <Practice
          vocab={vocab}
          groupId={view.groupId}
          exerciseType={view.exercise}
          srs={srs}
          onSrsChange={setSrs}
          onFinish={() => setView({ name: 'picker', groupId: view.groupId })}
        />
      )}
    </div>
  )
}
