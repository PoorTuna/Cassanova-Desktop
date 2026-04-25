/**
 * Channel names for main<->renderer IPC. Single source of truth — both sides import from here.
 */
export const IpcChannels = {
  // Instances
  instancesList: 'instances:list',
  instancesUpsert: 'instances:upsert',
  instancesDelete: 'instances:delete',
  instancesChanged: 'instances:changed',
  instancesOpenWindow: 'instances:openWindow',

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

  // Certs — TLS trust on first use. Self-signed deployments are pinned to an
  // instance by SHA-256 fingerprint; mismatches on later connects hard-block.
  certsPrompt: 'certs:prompt',
  certsPromptResponse: 'certs:promptResponse',
  certsMismatch: 'certs:mismatch',
  certsRevoke: 'certs:revoke',

  // Updater — electron-updater wrapper. autoDownload off; user opts in.
  updaterCheck: 'updater:check',
  updaterDownload: 'updater:download',
  updaterInstall: 'updater:install',
  updaterGetStatus: 'updater:getStatus',
  updaterStatus: 'updater:status',
} as const

export type MenuAction = 'newInstance' | 'openSettings' | 'reload' | 'toggleSidebar'

export interface VaultRecord {
  username: string
  password: string
}

export type LoginResult =
  | { ok: true }
  | { ok: false; status: number; message: string }

export interface CertPromptPayload {
  promptId: string
  instanceId: string
  instanceName: string
  url: string
  errorCode: string
  fingerprint: string
  subjectCommonName: string
  issuerCommonName: string
  validStart: number
  validExpiry: number
}

export interface CertPromptResponse {
  promptId: string
  trust: boolean
}

export interface CertMismatchPayload {
  instanceId: string
  instanceName: string
  url: string
  pinnedFingerprint: string
  seenFingerprint: string
}

export type UpdaterStatus =
  | { phase: 'idle' }
  | { phase: 'checking' }
  | { phase: 'available'; version: string; releaseDate?: string }
  | { phase: 'not-available'; version: string }
  | {
      phase: 'downloading'
      percent: number
      bytesPerSecond: number
      transferred: number
      total: number
    }
  | { phase: 'downloaded'; version: string }
  | { phase: 'error'; message: string }
