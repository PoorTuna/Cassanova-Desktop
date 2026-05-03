import { ipcMain, BrowserWindow } from 'electron'
import { IpcChannels } from '@shared/ipc-contract'
import type { ChromeColorsPayload } from '@shared/ipc-contract'

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

function senderWindow(event: Electron.IpcMainEvent): BrowserWindow | null {
  return BrowserWindow.fromWebContents(event.sender)
}

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

  // Routes by sender so detached instance windows also re-theme.
  ipcMain.on(
    IpcChannels.windowSetChromeColors,
    (event, payload: ChromeColorsPayload) => {
      if (
        !payload ||
        !HEX_COLOR.test(payload.background) ||
        !HEX_COLOR.test(payload.titleBarColor) ||
        !HEX_COLOR.test(payload.titleBarSymbolColor)
      ) {
        return
      }
      const win = senderWindow(event)
      if (!win || win.isDestroyed()) return
      win.setBackgroundColor(payload.background)
      // setTitleBarOverlay is Windows-only. macOS uses traffic lights and
      // throws here; Linux is a no-op. Wrap for cross-platform safety.
      try {
        win.setTitleBarOverlay({
          color: payload.titleBarColor,
          symbolColor: payload.titleBarSymbolColor,
          height: 36,
        })
      } catch {
        // Not supported on this platform.
      }
    },
  )

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send(IpcChannels.windowMaximizeChanged, true)
  })

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send(IpcChannels.windowMaximizeChanged, false)
  })
}
