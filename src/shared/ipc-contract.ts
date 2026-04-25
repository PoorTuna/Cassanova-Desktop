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

  // Vault — credentials live in OS keychain, never reach renderer in plaintext form
  vaultSet: 'vault:set',
  vaultDelete: 'vault:delete',
  vaultHas: 'vault:has',
  vaultListIds: 'vault:listIds',
  vaultChanged: 'vault:changed',

  // Auth — main performs login against Cassanova /login, writes cookie into partition session
  authLogin: 'auth:login',

  // Certs (Phase 3)
  certsTrust: 'certs:trust',
  certsList: 'certs:list',
} as const

export type MenuAction = 'newInstance' | 'openSettings' | 'reload' | 'toggleSidebar'

export interface VaultRecord {
  username: string
  password: string
}

export type LoginResult =
  | { ok: true }
  | { ok: false; status: number; message: string }
