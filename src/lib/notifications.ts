import type { StreakData } from './streak'

const PREF_KEY = 'jayfrances_notifications_v1'

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function areRemindersEnabled(): boolean {
  try {
    return localStorage.getItem(PREF_KEY) === 'on'
  } catch {
    return false
  }
}

export async function enableReminders(): Promise<boolean> {
  if (!isNotificationSupported()) return false
  const permission = await Notification.requestPermission()
  const granted = permission === 'granted'
  try {
    localStorage.setItem(PREF_KEY, granted ? 'on' : 'off')
  } catch {
    // localStorage puede fallar por cuota llena o modo privado
  }
  return granted
}

export function disableReminders() {
  try {
    localStorage.setItem(PREF_KEY, 'off')
  } catch {
    // localStorage puede fallar por cuota llena o modo privado
  }
}

// Recordatorio "best effort": como la app no tiene un servidor de push, solo
// puede avisar mientras está abierta (o al reabrirla) si todavía no
// practicaste hoy. Para notificaciones reales en segundo plano haría falta
// un backend de push (fuera del alcance de una app 100% cliente).
export function maybeShowReminder(streak: StreakData) {
  if (!isNotificationSupported() || !areRemindersEnabled()) return
  if (Notification.permission !== 'granted') return
  const today = new Date().toISOString().slice(0, 10)
  if (streak.lastActiveDate === today) return
  new Notification('Repaso de Francés', {
    body: '¡No pierdas tu racha! Repasa unas palabras hoy 🇫🇷',
    icon: '/favicon.svg',
  })
}
