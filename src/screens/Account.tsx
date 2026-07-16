import { useState } from 'react'
import { supabase, supabaseEnabled } from '../lib/supabase'
import { loadSessionHistory } from '../lib/sessionHistory'
import { areRemindersEnabled, disableReminders, enableReminders, isNotificationSupported } from '../lib/notifications'
import { GROUPS } from '../data/categories'
import type { ExerciseType } from '../types'

interface Props {
  userEmail: string | null
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error'
  onSignedIn: () => void
  onSignOut: () => void
  onSyncNow: () => void
  onBack: () => void
}

const EXERCISE_LABEL: Record<string, string> = {
  flashcards: 'Flashcards',
  opcion_multiple: 'Opción múltiple',
  genero: 'Masculino o femenino',
  conjugacion: 'Conjugación',
  completar: 'Escribir la palabra',
  dictado: 'Dictado',
}

export default function Account({ userEmail, syncStatus, onSignedIn, onSignOut, onSyncNow, onBack }: Props) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [remindersOn, setRemindersOn] = useState(areRemindersEnabled())
  const history = loadSessionHistory()

  async function handleToggleReminders() {
    if (remindersOn) {
      disableReminders()
      setRemindersOn(false)
      return
    }
    const granted = await enableReminders()
    setRemindersOn(granted)
  }

  async function handleSendLink(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase) return
    setError('')
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      setError(error.message)
      return
    }
    setSent(true)
    onSignedIn()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-16 pt-8">
      <button onClick={onBack} className="text-sky-400 text-sm mb-4 tap-scale">
        ← Volver
      </button>
      <h1 className="text-xl font-bold mb-1">Cuenta y sincronización</h1>
      <p className="text-slate-400 text-sm mb-6">
        Sincroniza tu progreso entre dispositivos y consulta tu historial de sesiones.
      </p>

      {!supabaseEnabled && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-600/30 p-4 mb-8 text-sm text-amber-300">
          La sincronización en la nube no está configurada todavía. Define{' '}
          <code className="text-amber-200">VITE_SUPABASE_URL</code> y{' '}
          <code className="text-amber-200">VITE_SUPABASE_ANON_KEY</code> (ver README) para activarla. Mientras
          tanto, tu progreso sigue guardándose normalmente en este dispositivo.
        </div>
      )}

      {supabaseEnabled && !userEmail && (
        <form onSubmit={handleSendLink} className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 flex flex-col gap-3 mb-8">
          <label htmlFor="email-input" className="text-xs text-slate-400">
            Recibe un enlace mágico para iniciar sesión sin contraseña:
          </label>
          <input
            id="email-input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-sky-500"
          />
          {error && <p className="text-rose-400 text-sm">{error}</p>}
          {sent ? (
            <p className="text-emerald-400 text-sm">
              Revisa tu correo y abre el enlace para completar el inicio de sesión.
            </p>
          ) : (
            <button type="submit" className="tap-scale rounded-lg bg-sky-600 hover:bg-sky-500 px-4 py-2 font-medium self-start">
              Enviar enlace
            </button>
          )}
        </form>
      )}

      {supabaseEnabled && userEmail && (
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 mb-8 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm text-slate-100">Sincronizado como {userEmail}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {syncStatus === 'syncing' && 'Sincronizando...'}
              {syncStatus === 'synced' && 'Al día'}
              {syncStatus === 'error' && 'Error al sincronizar, se reintentará'}
              {syncStatus === 'idle' && 'Sin cambios pendientes'}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={onSyncNow} className="tap-scale text-xs rounded-full border border-slate-700 px-4 py-1.5 hover:border-sky-600/60">
              Sincronizar ahora
            </button>
            <button onClick={onSignOut} className="tap-scale text-xs rounded-full border border-slate-700 px-4 py-1.5 text-rose-300 hover:border-rose-600/60">
              Cerrar sesión
            </button>
          </div>
        </div>
      )}

      {isNotificationSupported() && (
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 mb-8 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-100">🔔 Recordatorio diario</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Avisa (mientras la app está abierta) si todavía no repasaste hoy.
            </p>
          </div>
          <button
            onClick={handleToggleReminders}
            className={`tap-scale text-xs rounded-full border px-4 py-1.5 ${
              remindersOn ? 'border-emerald-600/50 text-emerald-300' : 'border-slate-700 hover:border-sky-600/60'
            }`}
          >
            {remindersOn ? 'Activado' : 'Activar'}
          </button>
        </div>
      )}

      <h2 className="text-sm font-semibold text-slate-300 mb-3">Historial de sesiones</h2>
      {history.length === 0 ? (
        <p className="text-slate-500 text-sm">Todavía no completaste ninguna sesión.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {history.slice(0, 30).map((s) => {
            const group = GROUPS.find((g) => g.id === s.groupId)
            const pct = s.total === 0 ? 0 : Math.round((s.correct / s.total) * 100)
            return (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-lg bg-slate-900/60 border border-slate-800 px-4 py-2 text-sm"
              >
                <div>
                  <span className="text-slate-100">
                    {group
                      ? `${group.emoji} ${group.label}`
                      : s.groupId === 'palabras-dificiles'
                        ? '🎯 Palabras difíciles'
                        : s.groupId}
                  </span>
                  <span className="text-slate-500"> · {EXERCISE_LABEL[s.exerciseType as ExerciseType] ?? s.exerciseType}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>{new Date(s.date).toLocaleDateString()}</span>
                  <span className={pct >= 70 ? 'text-emerald-400' : 'text-slate-400'}>
                    {s.correct}/{s.total} ({pct}%)
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
