import { ipcMain, BrowserWindow } from 'electron'
import { IpcChannels } from '@shared/ipc-contract'
import type { VaultRecord } from '@shared/ipc-contract'
import type { InstanceId } from '@shared/models'
import { vault } from '../storage/vault'

function broadcastChanged(): void {
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send(IpcChannels.vaultChanged)
  }
}

export function registerVaultHandlers(): void {
  ipcMain.handle(
    IpcChannels.vaultSet,
    async (_event, id: InstanceId, record: VaultRecord) => {
      await vault.set(id, record)
      broadcastChanged()
    },
  )

  ipcMain.handle(IpcChannels.vaultDelete, async (_event, id: InstanceId) => {
    const removed = await vault.delete(id)
    if (removed) broadcastChanged()
    return removed
  })

  ipcMain.handle(IpcChannels.vaultHas, (_event, id: InstanceId) => vault.has(id))

  ipcMain.handle(IpcChannels.vaultListIds, () => vault.listIds())
}
