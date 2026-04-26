import { ipcMain } from 'electron'
import { IpcChannels } from '@shared/ipc-contract'
import type { LoginResult } from '@shared/ipc-contract'
import type { InstanceId } from '@shared/models'
import { instancesStore } from '../storage/instances-store'
import { vault } from '../storage/vault'
import { performLogin } from '../auth/login'

// Coalesce concurrent login calls per instance. React StrictMode and
// rapid re-mounts otherwise fire two POST /login requests in parallel,
// each one stomping the other's cookie.
const inflight = new Map<InstanceId, Promise<LoginResult>>()

export function registerAuthHandlers(): void {
  ipcMain.handle(IpcChannels.authLogin, async (_event, id: InstanceId) => {
    const existing = inflight.get(id)
    if (existing) return existing

    const promise = (async (): Promise<LoginResult> => {
      const instance = instancesStore.list().find((i) => i.id === id)
      if (!instance) {
        return { ok: false, status: 0, message: 'Unknown instance' }
      }
      const creds = await vault.get(id)
      if (!creds) {
        return { ok: false, status: 0, message: 'No stored credentials' }
      }
      return performLogin(instance, creds)
    })().finally(() => {
      inflight.delete(id)
    })
    inflight.set(id, promise)
    return promise
  })
}
