import { app, BrowserWindow, shell, Menu, nativeTheme, crashReporter } from 'electron'
import { createMainWindow } from './window'
import { registerIpcHandlers } from './ipc/register'
import { buildAppMenu } from './menu'
import { startHealthPoller } from './health/poller'
import { startUpdater } from './updater'
import { IpcChannels } from '@shared/ipc-contract'
import { getLogger } from './_logger'

// crashReporter must start before app is ready so Crashpad attaches to all
// processes spawned afterwards. uploadToServer:false keeps minidumps local
// under userData/Crashpad/. Electron treats submitURL as required even when
// uploadToServer is false, so we pass an unused localhost placeholder.
crashReporter.start({
  productName: 'Cassanova Desktop',
  companyName: 'Cassanova',
  submitURL: 'https://localhost/_unused',
  uploadToServer: false,
  ignoreSystemCrashHandler: false,
})

// Renderer drives the theme via class on <html> + injected CSS into webviews.
// Leave nativeTheme on 'system' so prefers-color-scheme and OS chrome follow
// the user's OS preference, and don't override the renderer's class.
nativeTheme.themeSource = 'system'

const log = getLogger('main')

process.on('uncaughtException', (err) => {
  log.error('uncaughtException', undefined, err)
})
process.on('unhandledRejection', (reason) => {
  log.error('unhandledRejection', undefined, reason)
})

app.whenReady().then(() => {
  log.info('app.ready', { version: app.getVersion(), platform: process.platform })
  const mainWindow = createMainWindow()

  registerIpcHandlers(mainWindow)
  Menu.setApplicationMenu(buildAppMenu(mainWindow))
  startHealthPoller()
  startUpdater()

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
  log.info('window-all-closed')
  if (process.platform !== 'darwin') app.quit()
})
