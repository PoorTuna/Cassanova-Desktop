import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import { createWindowState } from './window-state'

const isDev = !app.isPackaged

export function createMainWindow(): BrowserWindow {
  const isMac = process.platform === 'darwin'

  const windowState = createWindowState({
    defaultWidth: 1280,
    defaultHeight: 800,
  })

  const mainWindow = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    minWidth: 960,
    minHeight: 600,
    show: false,
    frame: false,
    icon: join(__dirname, '../../resources/icon.png'),
    backgroundColor: '#08080a',
    titleBarStyle: isMac ? 'hiddenInset' : 'hidden',
    ...(isMac
      ? { trafficLightPosition: { x: 12, y: 12 } }
      : {
          titleBarOverlay: {
            color: '#08080a',
            symbolColor: '#ffffff',
            height: 36,
          },
        }),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      webviewTag: true,
    },
  })

  windowState.manage(mainWindow)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  const devUrl = process.env['ELECTRON_RENDERER_URL']
  if (isDev && devUrl) {
    mainWindow.loadURL(devUrl)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}
