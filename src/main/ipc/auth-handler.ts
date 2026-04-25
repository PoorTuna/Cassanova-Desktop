import { ipcMain } from 'electron'
import { IpcChannels } from '@shared/ipc-contract'
import type { InstanceId } from '@shared/models'
import { instancesStore } from '../storage/instances-store'
import { vault } from '../storage/vault'
import { performLogin } from '../auth/login'

export function registerAuthHandlers(): void {
  ipcMain.handle(IpcChannels.authLogin, async (_event, id: InstanceId) => {
    const instance = instancesStore.list().find((i) => i.id === id)
    if (!instance) {
      return { ok: false, status: 0, message: 'Unknown instance' }
    }
    const creds = await vault.get(id)
    if (!creds) {
      return { ok: false, status: 0, message: 'No stored credentials' }
    }
    return performLogin(instance, creds)
  })
}
