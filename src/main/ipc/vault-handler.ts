import { ipcMain, BrowserWindow } from 'electron'
import { IpcChannels } from '@shared/ipc-contract'
import type { VaultRecord } from '@shared/ipc-contract'
import type { InstanceId } from '@shared/models'
import { vault } from '../storage/vault'
import { getLogger } from '../_logger'

const log = getLogger('ipc.vault')

function broadcastChanged(): void {
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send(IpcChannels.vaultChanged)
  }
}

export function registerVaultHandlers(): void {
  ipcMain.handle(
    IpcChannels.vaultSet,
    async (_event, id: InstanceId, record: VaultRecord) => {
      try {
        await vault.set(id, record)
        log.info('credentials saved', { id })
      } catch (err) {
        log.error('vault.set failed', { id }, err)
        throw err
      }
      broadcastChanged()
    },
  )

  ipcMain.handle(IpcChannels.vaultDelete, async (_event, id: InstanceId) => {
    const removed = await vault.delete(id)
    if (removed) {
      log.info('credentials cleared', { id })
      broadcastChanged()
    }
    return removed
  })

  ipcMain.handle(IpcChannels.vaultHas, (_event, id: InstanceId) => vault.has(id))

  ipcMain.handle(IpcChannels.vaultListIds, () => vault.listIds())
}
