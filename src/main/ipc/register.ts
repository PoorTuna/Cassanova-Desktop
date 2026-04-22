import { app, ipcMain, shell } from 'electron'
import type { BrowserWindow } from 'electron'
import { join } from 'path'
import { IpcChannels } from '@shared/ipc-contract'
import { registerInstancesHandlers } from './instances-handler'
import { registerWindowHandlers } from './window-handler'

export function registerIpcHandlers(mainWindow: BrowserWindow): void {
  registerInstancesHandlers()
  registerWindowHandlers(mainWindow)

  ipcMain.handle(IpcChannels.appPlatform, () => process.platform)
  ipcMain.handle(IpcChannels.appVersion, () => {
    return app.getVersion()
  })
  ipcMain.handle(IpcChannels.appOpenExternal, (_event, url: string) => {
    return shell.openExternal(url)
  })
  ipcMain.handle(IpcChannels.appWebviewPreloadPath, () => {
    return join(__dirname, 'webview-preload.js')
  })
}
