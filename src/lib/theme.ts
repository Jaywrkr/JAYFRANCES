export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'jayfrances_theme_v1'

export function loadTheme(): Theme {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export function saveTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // ignorar si localStorage no está disponible
  }
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
}
