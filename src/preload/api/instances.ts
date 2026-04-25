import { ipcRenderer } from 'electron'
import { IpcChannels } from '@shared/ipc-contract'
import type { Instance, InstanceId } from '@shared/models'

export const instancesApi = {
  list: (): Promise<Instance[]> => ipcRenderer.invoke(IpcChannels.instancesList),
  upsert: (instance: Instance): Promise<Instance> =>
    ipcRenderer.invoke(IpcChannels.instancesUpsert, instance),
  delete: (id: InstanceId): Promise<void> =>
    ipcRenderer.invoke(IpcChannels.instancesDelete, id),
  openWindow: (id: InstanceId): Promise<void> =>
    ipcRenderer.invoke(IpcChannels.instancesOpenWindow, id),
  onChanged: (callback: (instances: Instance[]) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, instances: Instance[]) =>
      callback(instances)
    ipcRenderer.on(IpcChannels.instancesChanged, handler)
    return () => {
      ipcRenderer.removeListener(IpcChannels.instancesChanged, handler)
    }
  },
}
