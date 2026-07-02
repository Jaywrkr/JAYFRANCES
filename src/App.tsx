import { useEffect, useState } from 'react'
import Home from './screens/Home'
import ExercisePicker from './screens/ExercisePicker'
import Practice from './screens/Practice'
import Flashcards from './screens/Flashcards'
import { loadSrs } from './lib/srs'
import type { ExerciseType, SrsStore } from './types'

type View =
  | { name: 'home' }
  | { name: 'picker'; groupId: string }
  | { name: 'session'; groupId: string; exercise: ExerciseType }

export default function App() {
  const [srs, setSrs] = useState<SrsStore>({})
  const [view, setView] = useState<View>({ name: 'home' })

  useEffect(() => {
    setSrs(loadSrs())
  }, [])

  return (
    <div className="min-h-screen">
      {view.name === 'home' && (
        <Home srs={srs} onSelectGroup={(groupId) => setView({ name: 'picker', groupId })} />
      )}

      {view.name === 'picker' && (
        <ExercisePicker
          groupId={view.groupId}
          onBack={() => setView({ name: 'home' })}
          onStart={(exercise) => setView({ name: 'session', groupId: view.groupId, exercise })}
        />
      )}

      {view.name === 'session' && view.exercise === 'flashcards' && (
        <Flashcards
          groupId={view.groupId}
          srs={srs}
          onSrsChange={setSrs}
          onFinish={() => setView({ name: 'picker', groupId: view.groupId })}
        />
      )}

      {view.name === 'session' && view.exercise !== 'flashcards' && (
        <Practice
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
