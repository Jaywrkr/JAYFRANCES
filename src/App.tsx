import { useEffect, useMemo, useState } from 'react'
import Home from './screens/Home'
import ExercisePicker from './screens/ExercisePicker'
import Practice from './screens/Practice'
import Flashcards from './screens/Flashcards'
import ManageVocab from './screens/ManageVocab'
import Stats from './screens/Stats'
import Account from './screens/Account'
import WeakSpots from './screens/WeakSpots'
import { loadSrs, saveSrs } from './lib/srs'
import { loadCustomVocab } from './lib/customVocab'
import { applyTheme, loadTheme, saveTheme, type Theme } from './lib/theme'
import { loadStreak, recordActivityToday, type StreakData } from './lib/streak'
import { recordReview } from './lib/activityLog'
import { recordSession } from './lib/sessionHistory'
import { maybeShowReminder } from './lib/notifications'
import { supabase } from './lib/supabase'
import { mergeCustomVocab, mergeSrs, pullProgress, pushProgress } from './lib/sync'
import { VOCAB } from './data/vocab'
import type { ExerciseType, SrsStore, VocabEntry } from './types'

type View =
  | { name: 'home' }
  | { name: 'picker'; groupId: string }
  | { name: 'session'; groupId: string; exercise: ExerciseType }
  | { name: 'manageVocab' }
  | { name: 'stats' }
  | { name: 'account' }
  | { name: 'weakSpots' }
  | { name: 'weakSpotsSession'; entries: VocabEntry[]; exercise: ExerciseType }

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error'

export default function App() {
  const [srs, setSrs] = useState<SrsStore>({})
  const [customVocab, setCustomVocab] = useState<VocabEntry[]>([])
  const [theme, setTheme] = useState<Theme>('dark')
  const [streak, setStreak] = useState<StreakData>({ lastActiveDate: '', currentStreak: 0, longestStreak: 0 })
  const [view, setView] = useState<View>({ name: 'home' })
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')

  useEffect(() => {
    const localSrs = loadSrs()
    const localCustomVocab = loadCustomVocab()
    setSrs(localSrs)
    setCustomVocab(localCustomVocab)
    const initialStreak = loadStreak()
    setStreak(initialStreak)
    const initialTheme = loadTheme()
    setTheme(initialTheme)
    applyTheme(initialTheme)
    maybeShowReminder(initialStreak)

    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user
      if (user) {
        setUserId(user.id)
        setUserEmail(user.email ?? null)
        syncWithRemote(user.id, localSrs, localCustomVocab)
      }
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user
      setUserId(user?.id ?? null)
      setUserEmail(user?.email ?? null)
      if (user) syncWithRemote(user.id, srs, customVocab)
    })
    return () => sub.subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function syncWithRemote(uid: string, localSrs: SrsStore, localCustomVocab: VocabEntry[]) {
    setSyncStatus('syncing')
    try {
      const remote = await pullProgress(uid)
      const mergedSrs = remote ? mergeSrs(localSrs, remote.srs) : localSrs
      const mergedCustomVocab = remote ? mergeCustomVocab(localCustomVocab, remote.customVocab) : localCustomVocab
      setSrs(mergedSrs)
      setCustomVocab(mergedCustomVocab)
      saveSrs(mergedSrs)
      await pushProgress(uid, mergedSrs, mergedCustomVocab)
      setSyncStatus('synced')
    } catch {
      setSyncStatus('error')
    }
  }

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    applyTheme(next)
    saveTheme(next)
  }

  function handleSrsChange(next: SrsStore, correct: boolean) {
    setSrs(next)
    recordReview(correct)
    setStreak(recordActivityToday())
    if (userId) pushProgress(userId, next, customVocab)
  }

  function handleCustomVocabChange(next: VocabEntry[]) {
    setCustomVocab(next)
    if (userId) pushProgress(userId, srs, next)
  }

  function handleSessionComplete(groupId: string, exerciseType: ExerciseType, correct: number, total: number) {
    recordSession({ groupId, exerciseType, correct, total })
  }

  const vocab = useMemo(() => [...VOCAB, ...customVocab], [customVocab])

  return (
    <div className="min-h-screen">
      {view.name === 'home' && (
        <Home
          vocab={vocab}
          srs={srs}
          theme={theme}
          streak={streak}
          onToggleTheme={toggleTheme}
          onSelectGroup={(groupId) => setView({ name: 'picker', groupId })}
          onManageVocab={() => setView({ name: 'manageVocab' })}
          onShowStats={() => setView({ name: 'stats' })}
          onShowAccount={() => setView({ name: 'account' })}
          onShowWeakSpots={() => setView({ name: 'weakSpots' })}
        />
      )}

      {view.name === 'weakSpots' && (
        <WeakSpots
          vocab={vocab}
          srs={srs}
          onBack={() => setView({ name: 'home' })}
          onStart={(entries, exercise) => setView({ name: 'weakSpotsSession', entries, exercise })}
        />
      )}

      {view.name === 'weakSpotsSession' && view.exercise === 'flashcards' && (
        <Flashcards
          vocab={vocab}
          groupId="palabras-dificiles"
          overrideEntries={view.entries}
          srs={srs}
          onSrsChange={handleSrsChange}
          onSessionComplete={(correct, total) =>
            handleSessionComplete('palabras-dificiles', view.exercise, correct, total)
          }
          onFinish={() => setView({ name: 'weakSpots' })}
        />
      )}

      {view.name === 'weakSpotsSession' && view.exercise !== 'flashcards' && (
        <Practice
          vocab={vocab}
          groupId="palabras-dificiles"
          overrideEntries={view.entries}
          exerciseType={view.exercise}
          srs={srs}
          onSrsChange={handleSrsChange}
          onSessionComplete={(correct, total) =>
            handleSessionComplete('palabras-dificiles', view.exercise, correct, total)
          }
          onFinish={() => setView({ name: 'weakSpots' })}
        />
      )}

      {view.name === 'manageVocab' && (
        <ManageVocab
          customVocab={customVocab}
          onChange={handleCustomVocabChange}
          onBack={() => setView({ name: 'home' })}
        />
      )}

      {view.name === 'stats' && (
        <Stats
          vocab={vocab}
          srs={srs}
          streak={streak}
          customVocabCount={customVocab.length}
          onBack={() => setView({ name: 'home' })}
        />
      )}

      {view.name === 'account' && (
        <Account
          userEmail={userEmail}
          syncStatus={syncStatus}
          onSignedIn={() => {}}
          onSignOut={() => supabase?.auth.signOut()}
          onSyncNow={() => userId && syncWithRemote(userId, srs, customVocab)}
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
          onSrsChange={handleSrsChange}
          onSessionComplete={(correct, total) =>
            handleSessionComplete(view.groupId, view.exercise, correct, total)
          }
          onFinish={() => setView({ name: 'picker', groupId: view.groupId })}
        />
      )}

      {view.name === 'session' && view.exercise !== 'flashcards' && (
        <Practice
          vocab={vocab}
          groupId={view.groupId}
          exerciseType={view.exercise}
          srs={srs}
          onSrsChange={handleSrsChange}
          onSessionComplete={(correct, total) =>
            handleSessionComplete(view.groupId, view.exercise, correct, total)
          }
          onFinish={() => setView({ name: 'picker', groupId: view.groupId })}
        />
      )}
    </div>
  )
}
