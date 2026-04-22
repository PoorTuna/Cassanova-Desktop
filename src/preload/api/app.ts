import { ipcRenderer } from 'electron'
import { IpcChannels } from '@shared/ipc-contract'
import type { MenuAction } from '@shared/ipc-contract'

export const appApi = {
  platform: (): Promise<NodeJS.Platform> => ipcRenderer.invoke(IpcChannels.appPlatform),
  version: (): Promise<string> => ipcRenderer.invoke(IpcChannels.appVersion),
  openExternal: (url: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannels.appOpenExternal, url),
  webviewPreloadPath: (): Promise<string> =>
    ipcRenderer.invoke(IpcChannels.appWebviewPreloadPath),
  onMenuAction: (callback: (action: MenuAction) => void) => {
    const newInstanceHandler = () => callback('newInstance')
    const settingsHandler = () => callback('openSettings')
    const menuActionHandler = () => callback('reload')
    ipcRenderer.on(IpcChannels.menuNewInstance, newInstanceHandler)
    ipcRenderer.on(IpcChannels.menuOpenSettings, settingsHandler)
    ipcRenderer.on(IpcChannels.menuAction, menuActionHandler)
    return () => {
      ipcRenderer.removeListener(IpcChannels.menuNewInstance, newInstanceHandler)
      ipcRenderer.removeListener(IpcChannels.menuOpenSettings, settingsHandler)
      ipcRenderer.removeListener(IpcChannels.menuAction, menuActionHandler)
    }
  },
}
