import { app, BrowserWindow, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import { IpcChannels } from '@shared/ipc-contract'
import type { UpdaterStatus } from '@shared/ipc-contract'

let lastStatus: UpdaterStatus = { phase: 'idle' }

function emit(status: UpdaterStatus): void {
  lastStatus = status
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send(IpcChannels.updaterStatus, status)
  }
}

export function registerUpdaterHandlers(): void {
  ipcMain.handle(IpcChannels.updaterGetStatus, () => lastStatus)

  ipcMain.handle(IpcChannels.updaterCheck, async () => {
    if (!app.isPackaged) {
      emit({ phase: 'error', message: 'Updates are disabled in development.' })
      return
    }
    try {
      await autoUpdater.checkForUpdates()
    } catch (err) {
      emit({
        phase: 'error',
        message: err instanceof Error ? err.message : 'Update check failed',
      })
    }
  })

  ipcMain.handle(IpcChannels.updaterDownload, async () => {
    if (!app.isPackaged) return
    try {
      await autoUpdater.downloadUpdate()
    } catch (err) {
      emit({
        phase: 'error',
        message: err instanceof Error ? err.message : 'Update download failed',
      })
    }
  })

  ipcMain.handle(IpcChannels.updaterInstall, () => {
    if (!app.isPackaged) return
    autoUpdater.quitAndInstall()
  })
}

export function startUpdater(): void {
  // Skip in dev — autoUpdater requires a signed/published build and would
  // otherwise spam errors on every run.
  if (!app.isPackaged) {
    emit({ phase: 'idle' })
    return
  }

  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => emit({ phase: 'checking' }))
  autoUpdater.on('update-available', (info) =>
    emit({ phase: 'available', version: info.version, releaseDate: info.releaseDate }),
  )
  autoUpdater.on('update-not-available', (info) =>
    emit({ phase: 'not-available', version: info.version }),
  )
  autoUpdater.on('error', (err) =>
    emit({ phase: 'error', message: err?.message ?? 'Updater error' }),
  )
  autoUpdater.on('download-progress', (progress) =>
    emit({
      phase: 'downloading',
      percent: progress.percent,
      bytesPerSecond: progress.bytesPerSecond,
      transferred: progress.transferred,
      total: progress.total,
    }),
  )
  autoUpdater.on('update-downloaded', (info) =>
    emit({ phase: 'downloaded', version: info.version }),
  )

  autoUpdater.checkForUpdates().catch(() => {
    // Initial check error is surfaced via the 'error' event above.
  })
}
