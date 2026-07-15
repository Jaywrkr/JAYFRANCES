import { supabase } from './supabase'
import type { SrsStore, VocabEntry } from '../types'

export interface RemoteProgress {
  srs: SrsStore
  customVocab: VocabEntry[]
  updated_at: string
}

// Combina el progreso local con el remoto sin perder avances de ningún lado:
// para cada palabra nos quedamos con la repetición SM-2 más alta, y el
// vocabulario propio se une por id.
export function mergeSrs(local: SrsStore, remote: SrsStore): SrsStore {
  const merged: SrsStore = { ...remote }
  for (const [id, localState] of Object.entries(local)) {
    const remoteState = remote[id]
    if (!remoteState || localState.repetitions >= remoteState.repetitions) {
      merged[id] = localState
    }
  }
  return merged
}

export function mergeCustomVocab(local: VocabEntry[], remote: VocabEntry[]): VocabEntry[] {
  const byId = new Map<string, VocabEntry>()
  for (const entry of remote) byId.set(entry.id, entry)
  for (const entry of local) byId.set(entry.id, entry)
  return [...byId.values()]
}

export async function pullProgress(userId: string): Promise<RemoteProgress | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('progress')
    .select('srs, custom_vocab, updated_at')
    .eq('user_id', userId)
    .maybeSingle()
  if (error || !data) return null
  return {
    srs: (data.srs as SrsStore) ?? {},
    customVocab: (data.custom_vocab as VocabEntry[]) ?? [],
    updated_at: data.updated_at as string,
  }
}

export async function pushProgress(userId: string, srs: SrsStore, customVocab: VocabEntry[]): Promise<void> {
  if (!supabase) return
  await supabase.from('progress').upsert({
    user_id: userId,
    srs,
    custom_vocab: customVocab,
    updated_at: new Date().toISOString(),
  })
}
