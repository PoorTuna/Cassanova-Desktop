import { ipcRenderer } from 'electron'
import { IpcChannels } from '@shared/ipc-contract'

export const windowApi = {
  minimize: () => ipcRenderer.send(IpcChannels.windowMinimize),
  maximize: () => ipcRenderer.send(IpcChannels.windowMaximize),
  close: () => ipcRenderer.send(IpcChannels.windowClose),
  isMaximized: (): Promise<boolean> => ipcRenderer.invoke(IpcChannels.windowIsMaximized),
  onMaximizeChanged: (callback: (maximized: boolean) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, maximized: boolean) =>
      callback(maximized)
    ipcRenderer.on(IpcChannels.windowMaximizeChanged, handler)
    return () => {
      ipcRenderer.removeListener(IpcChannels.windowMaximizeChanged, handler)
    }
  },
}
