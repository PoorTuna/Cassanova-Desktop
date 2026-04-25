import { app, ipcMain, shell } from 'electron'
import type { BrowserWindow } from 'electron'
import { join } from 'path'
import { pathToFileURL } from 'url'
import { IpcChannels } from '@shared/ipc-contract'
import { registerInstancesHandlers } from './instances-handler'
import { registerWindowHandlers } from './window-handler'
import { registerVaultHandlers } from './vault-handler'
import { registerAuthHandlers } from './auth-handler'

export function registerIpcHandlers(mainWindow: BrowserWindow): void {
  registerInstancesHandlers()
  registerWindowHandlers(mainWindow)
  registerVaultHandlers()
  registerAuthHandlers()

  ipcMain.handle(IpcChannels.appPlatform, () => process.platform)
  ipcMain.handle(IpcChannels.appVersion, () => {
    return app.getVersion()
  })
  ipcMain.handle(IpcChannels.appOpenExternal, (_event, url: string) => {
    return shell.openExternal(url)
  })
  ipcMain.handle(IpcChannels.appWebviewPreloadPath, () => {
    const path = join(__dirname, '..', 'preload', 'webview-preload.js')
    return pathToFileURL(path).href
  })
}
