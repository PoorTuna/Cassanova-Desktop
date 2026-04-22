import { app, BrowserWindow, shell, Menu } from 'electron'
import { createMainWindow } from './window'
import { registerIpcHandlers } from './ipc/register'
import { buildAppMenu } from './menu'

app.whenReady().then(() => {
  const mainWindow = createMainWindow()

  registerIpcHandlers(mainWindow)
  Menu.setApplicationMenu(buildAppMenu(mainWindow))

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
