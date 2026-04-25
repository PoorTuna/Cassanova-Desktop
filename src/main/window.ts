import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import { createWindowState } from './window-state'

const isDev = !app.isPackaged

const detachedWindows = new Map<string, BrowserWindow>()

export function createDetachedInstanceWindow(instanceId: string): BrowserWindow {
  const existing = detachedWindows.get(instanceId)
  if (existing && !existing.isDestroyed()) {
    if (existing.isMinimized()) existing.restore()
    existing.focus()
    return existing
  }

  const isMac = process.platform === 'darwin'
  const win = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 720,
    minHeight: 480,
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

  win.on('ready-to-show', () => win.show())
  win.on('closed', () => detachedWindows.delete(instanceId))

  const devUrl = process.env['ELECTRON_RENDERER_URL']
  const query = `?detachedInstanceId=${encodeURIComponent(instanceId)}`
  if (isDev && devUrl) {
    win.loadURL(`${devUrl}${query}`)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'), {
      search: query.slice(1),
    })
  }

  detachedWindows.set(instanceId, win)
  return win
}

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
