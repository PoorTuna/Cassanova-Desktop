import { ipcRenderer } from 'electron'
import { IpcChannels } from '@shared/ipc-contract'
import type { VaultRecord } from '@shared/ipc-contract'
import type { InstanceId } from '@shared/models'

export const vaultApi = {
  set: (id: InstanceId, record: VaultRecord): Promise<void> =>
    ipcRenderer.invoke(IpcChannels.vaultSet, id, record),
  delete: (id: InstanceId): Promise<boolean> =>
    ipcRenderer.invoke(IpcChannels.vaultDelete, id),
  has: (id: InstanceId): Promise<boolean> =>
    ipcRenderer.invoke(IpcChannels.vaultHas, id),
  listIds: (): Promise<InstanceId[]> =>
    ipcRenderer.invoke(IpcChannels.vaultListIds),
  onChanged: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on(IpcChannels.vaultChanged, handler)
    return () => {
      ipcRenderer.removeListener(IpcChannels.vaultChanged, handler)
    }
  },
}
