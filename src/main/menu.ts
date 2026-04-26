import { Menu, shell } from 'electron'
import type { BrowserWindow, MenuItemConstructorOptions } from 'electron'
import { IpcChannels } from '@shared/ipc-contract'
import { shortcutMap } from '@shared/shortcuts'

export function buildAppMenu(mainWindow: BrowserWindow): Menu {
  const isMac = process.platform === 'darwin'

  const send = (channel: string) => () => {
    mainWindow.webContents.send(channel)
  }

  const template: MenuItemConstructorOptions[] = []

  if (isMac) {
    template.push({
      role: 'appMenu',
    })
  }

  template.push({
    label: 'File',
    submenu: [
      {
        label: 'New Instance',
        accelerator: shortcutMap.newInstance.accelerator,
        click: send(IpcChannels.menuNewInstance),
      },
      { type: 'separator' },
      {
        label: 'Settings',
        accelerator: shortcutMap.openSettings.accelerator,
        click: send(IpcChannels.menuOpenSettings),
      },
      { type: 'separator' },
      isMac ? { role: 'close' } : { role: 'quit' },
    ],
  })

  template.push({
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectAll' },
    ],
  })

  template.push({
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        click: send(IpcChannels.menuAction),
      },
      {
        label: 'Open in New Window',
        accelerator: shortcutMap.detach.accelerator,
        click: send(IpcChannels.menuDetach),
      },
      { type: 'separator' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
    ],
  })

  if (isMac) {
    template.push({ role: 'windowMenu' })
  }

  template.push({
    label: 'Help',
    submenu: [
      {
        label: 'Cassanova on GitHub',
        click: () => shell.openExternal('https://github.com/PoorTuna/Cassanova'),
      },
      {
        label: 'Report an Issue',
        click: () =>
          shell.openExternal('https://github.com/PoorTuna/Cassanova-Desktop/issues'),
      },
    ],
  })

  return Menu.buildFromTemplate(template)
}
