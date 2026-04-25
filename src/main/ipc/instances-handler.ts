import { ipcMain, BrowserWindow } from 'electron'
import { IpcChannels } from '@shared/ipc-contract'
import type { Instance, InstanceId } from '@shared/models'
import { instancesStore } from '../storage/instances-store'
import { vault } from '../storage/vault'
import { createDetachedInstanceWindow } from '../window'

function broadcastChanged(): void {
  const instances = instancesStore.list()
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send(IpcChannels.instancesChanged, instances)
  }
}

export function registerInstancesHandlers(): void {
  ipcMain.handle(IpcChannels.instancesList, () => {
    return instancesStore.list()
  })

  ipcMain.handle(IpcChannels.instancesUpsert, (_event, instance: Instance) => {
    const result = instancesStore.upsert(instance)
    broadcastChanged()
    return result
  })

  ipcMain.handle(IpcChannels.instancesDelete, async (_event, id: InstanceId) => {
    instancesStore.delete(id)
    // Drop any keychain entry for this instance so deletes don't leave orphans.
    await vault.delete(id).catch(() => {})
    broadcastChanged()
  })

  ipcMain.handle(IpcChannels.instancesOpenWindow, (_event, id: InstanceId) => {
    const exists = instancesStore.list().some((i) => i.id === id)
    if (!exists) return
    createDetachedInstanceWindow(id)
  })
}
