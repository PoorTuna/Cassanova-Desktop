import { app, BrowserWindow, shell, Menu, nativeTheme } from 'electron'
import { createMainWindow } from './window'
import { registerIpcHandlers } from './ipc/register'
import { buildAppMenu } from './menu'
import { startHealthPoller } from './health/poller'
import { IpcChannels } from '@shared/ipc-contract'

nativeTheme.themeSource = 'dark'

app.whenReady().then(() => {
  const mainWindow = createMainWindow()

  registerIpcHandlers(mainWindow)
  Menu.setApplicationMenu(buildAppMenu(mainWindow))
  startHealthPoller()

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // Chromium's built-in Ctrl+R / Ctrl+Shift+R reload the entire renderer and
  // nuke app state. Intercept at the main process so our IPC reload path wins.
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return
    const ctrlOrMeta = input.control || input.meta
    if (!ctrlOrMeta) return
    const key = input.key.toLowerCase()
    if (key === 'r') {
      event.preventDefault()
      mainWindow.webContents.send(IpcChannels.menuAction)
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
