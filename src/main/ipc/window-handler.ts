import { ipcMain, BrowserWindow } from 'electron'
import { IpcChannels } from '@shared/ipc-contract'

export function registerWindowHandlers(mainWindow: BrowserWindow): void {
  ipcMain.on(IpcChannels.windowMinimize, () => {
    mainWindow.minimize()
  })

  ipcMain.on(IpcChannels.windowMaximize, () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  })

  ipcMain.on(IpcChannels.windowClose, () => {
    mainWindow.close()
  })

  ipcMain.handle(IpcChannels.windowIsMaximized, () => {
    return mainWindow.isMaximized()
  })

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send(IpcChannels.windowMaximizeChanged, true)
  })

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send(IpcChannels.windowMaximizeChanged, false)
  })
}
