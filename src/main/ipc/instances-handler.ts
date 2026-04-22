import { ipcMain, BrowserWindow } from 'electron'
import { IpcChannels } from '@shared/ipc-contract'
import type { Instance, InstanceId } from '@shared/models'
import { instancesStore } from '../storage/instances-store'

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

  ipcMain.handle(IpcChannels.instancesDelete, (_event, id: InstanceId) => {
    instancesStore.delete(id)
    broadcastChanged()
  })
}
