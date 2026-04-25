import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { Instance, InstanceId } from '@shared/models'
import { cassanova } from '@/lib/ipc'

export type DialogState =
  | { mode: 'closed' }
  | { mode: 'create'; preset?: InstanceDraft }
  | { mode: 'edit'; instance: Instance }

export interface InstanceDraft {
  name: string
  url: string
  authType: Instance['authType']
}

export interface DeleteRequest {
  id: InstanceId
  name: string
}

interface InstanceStore {
  instances: Instance[]
  hydrated: boolean
  dialog: DialogState
  pendingDelete: DeleteRequest | null
  /** Set of instance ids that have credentials in the OS keychain. */
  vaultIds: Set<InstanceId>

  hydrate: () => Promise<void>
  refreshVault: () => Promise<void>
  upsert: (instance: Instance) => Promise<void>
  remove: (id: InstanceId) => Promise<void>

  openCreate: () => void
  openEdit: (instance: Instance) => void
  openDuplicate: (id: InstanceId) => void
  closeDialog: () => void

  requestDelete: (instance: Instance) => void
  cancelDelete: () => void
}

let unsubscribeChanged: (() => void) | null = null
let unsubscribeVault: (() => void) | null = null

export const useInstanceStore = create<InstanceStore>((set, get) => ({
  instances: [],
  hydrated: false,
  dialog: { mode: 'closed' },
  pendingDelete: null,
  vaultIds: new Set(),

  hydrate: async () => {
    if (get().hydrated) return
    const [instances, vaultIds] = await Promise.all([
      cassanova().instances.list(),
      cassanova().vault.listIds(),
    ])
    set({ instances, vaultIds: new Set(vaultIds), hydrated: true })
    if (!unsubscribeChanged) {
      unsubscribeChanged = cassanova().instances.onChanged((next) =>
        set({ instances: next }),
      )
    }
    if (!unsubscribeVault) {
      unsubscribeVault = cassanova().vault.onChanged(() => {
        get().refreshVault().catch(() => {})
      })
    }
  },

  refreshVault: async () => {
    const ids = await cassanova().vault.listIds()
    set({ vaultIds: new Set(ids) })
  },

  upsert: async (instance) => {
    const snapshot = get().instances
    set({ instances: applyUpsert(snapshot, instance) })
    try {
      const saved = await cassanova().instances.upsert(instance)
      set({ instances: applyUpsert(get().instances, saved) })
    } catch (err) {
      set({ instances: snapshot })
      throw err
    }
  },

  remove: async (id) => {
    const snapshot = get().instances
    set({ instances: snapshot.filter((i) => i.id !== id) })
    try {
      await cassanova().instances.delete(id)
    } catch (err) {
      set({ instances: snapshot })
      throw err
    }
  },

  openCreate: () => set({ dialog: { mode: 'create' } }),
  openEdit: (instance) => set({ dialog: { mode: 'edit', instance } }),
  openDuplicate: (id) => {
    const original = get().instances.find((i) => i.id === id)
    if (!original) return
    set({
      dialog: {
        mode: 'create',
        preset: {
          name: `${original.name} (copy)`,
          url: original.url,
          authType: original.authType,
        },
      },
    })
  },
  closeDialog: () => set({ dialog: { mode: 'closed' } }),

  requestDelete: (instance) =>
    set({ pendingDelete: { id: instance.id, name: instance.name } }),
  cancelDelete: () => set({ pendingDelete: null }),
}))

function applyUpsert(list: Instance[], instance: Instance): Instance[] {
  const idx = list.findIndex((i) => i.id === instance.id)
  if (idx === -1) return [...list, instance]
  const next = list.slice()
  next[idx] = instance
  return next
}

export function buildInstance(draft: InstanceDraft): Instance {
  const now = new Date().toISOString()
  return {
    id: nanoid(),
    name: draft.name.trim(),
    url: draft.url,
    authType: draft.authType,
    createdAt: now,
    updatedAt: now,
  }
}

export function applyDraft(existing: Instance, draft: InstanceDraft): Instance {
  return {
    ...existing,
    name: draft.name.trim(),
    url: draft.url,
    authType: draft.authType,
    updatedAt: new Date().toISOString(),
  }
}
