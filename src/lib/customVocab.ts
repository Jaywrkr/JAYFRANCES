import type { VocabEntry } from '../types'

const STORAGE_KEY = 'jayfrances_custom_vocab_v1'

export function loadCustomVocab(): VocabEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as VocabEntry[]) : []
  } catch {
    return []
  }
}

function saveCustomVocab(entries: VocabEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // localStorage puede fallar por cuota llena o modo privado; se pierde la
    // persistencia pero la app sigue funcionando en memoria durante la sesión.
  }
}

export function addCustomWord(entry: Omit<VocabEntry, 'id'>): VocabEntry[] {
  const current = loadCustomVocab()
  const id = `custom:${entry.fr}:${Date.now()}`
  const updated = [...current, { ...entry, id }]
  saveCustomVocab(updated)
  return updated
}

export function removeCustomWord(id: string): VocabEntry[] {
  const updated = loadCustomVocab().filter((e) => e.id !== id)
  saveCustomVocab(updated)
  return updated
}
