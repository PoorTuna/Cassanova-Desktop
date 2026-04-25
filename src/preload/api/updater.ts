import { ipcRenderer } from 'electron'
import { IpcChannels } from '@shared/ipc-contract'
import type { UpdaterStatus } from '@shared/ipc-contract'

export const updaterApi = {
  check: (): Promise<void> => ipcRenderer.invoke(IpcChannels.updaterCheck),
  download: (): Promise<void> => ipcRenderer.invoke(IpcChannels.updaterDownload),
  install: (): Promise<void> => ipcRenderer.invoke(IpcChannels.updaterInstall),
  getStatus: (): Promise<UpdaterStatus> =>
    ipcRenderer.invoke(IpcChannels.updaterGetStatus),
  onStatus: (callback: (status: UpdaterStatus) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, status: UpdaterStatus) =>
      callback(status)
    ipcRenderer.on(IpcChannels.updaterStatus, handler)
    return () => {
      ipcRenderer.removeListener(IpcChannels.updaterStatus, handler)
    }
  },
}
