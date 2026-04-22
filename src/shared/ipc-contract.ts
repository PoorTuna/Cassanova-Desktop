import type { Instance, InstanceId } from './models'

/**
 * Channel names for main<->renderer IPC. Single source of truth — both sides import from here.
 */
export const IpcChannels = {
  // Instances
  instancesList: 'instances:list',
  instancesUpsert: 'instances:upsert',
  instancesDelete: 'instances:delete',
  instancesChanged: 'instances:changed',

  // Window management
  windowMinimize: 'window:minimize',
  windowMaximize: 'window:maximize',
  windowClose: 'window:close',
  windowIsMaximized: 'window:isMaximized',
  windowMaximizeChanged: 'window:maximizeChanged',

  // App info
  appPlatform: 'app:platform',
  appVersion: 'app:version',
  appOpenExternal: 'app:openExternal',
  appWebviewPreloadPath: 'app:webviewPreloadPath',

  // Menu actions (main → renderer)
  menuNewInstance: 'menu:newInstance',
  menuOpenSettings: 'menu:openSettings',
  menuAction: 'menu:action',

  // Vault (Phase 2)
  vaultGet: 'vault:get',
  vaultSet: 'vault:set',
  vaultDelete: 'vault:delete',

  // Certs (Phase 3)
  certsTrust: 'certs:trust',
  certsList: 'certs:list',
} as const

export type MenuAction = 'newInstance' | 'openSettings' | 'reload' | 'toggleSidebar'

export interface VaultRecord {
  username: string
  password: string
}

export interface IpcSurface {
  [IpcChannels.instancesList]: () => Promise<Instance[]>
  [IpcChannels.instancesUpsert]: (instance: Instance) => Promise<Instance>
  [IpcChannels.instancesDelete]: (id: InstanceId) => Promise<void>
  [IpcChannels.windowMinimize]: () => void
  [IpcChannels.windowMaximize]: () => void
  [IpcChannels.windowClose]: () => void
  [IpcChannels.windowIsMaximized]: () => Promise<boolean>
  [IpcChannels.appPlatform]: () => NodeJS.Platform
  [IpcChannels.appVersion]: () => string
  [IpcChannels.appOpenExternal]: (url: string) => Promise<void>
  [IpcChannels.appWebviewPreloadPath]: () => Promise<string>
}
