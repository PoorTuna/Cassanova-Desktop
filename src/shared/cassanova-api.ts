import type { Instance, InstanceId } from './models'
import type {
  CertMismatchPayload,
  CertPromptPayload,
  CertPromptResponse,
  LoginResult,
  MenuAction,
  UpdaterStatus,
  VaultRecord,
} from './ipc-contract'

export interface CassanovaInstancesAPI {
  list: () => Promise<Instance[]>
  upsert: (instance: Instance) => Promise<Instance>
  delete: (id: InstanceId) => Promise<void>
  onChanged: (callback: (instances: Instance[]) => void) => () => void
}

export interface CassanovaWindowAPI {
  minimize: () => void
  maximize: () => void
  close: () => void
  isMaximized: () => Promise<boolean>
  onMaximizeChanged: (callback: (maximized: boolean) => void) => () => void
}

export interface CassanovaAppAPI {
  platform: () => Promise<NodeJS.Platform>
  version: () => Promise<string>
  openExternal: (url: string) => Promise<void>
  webviewPreloadPath: () => Promise<string>
  onMenuAction: (callback: (action: MenuAction) => void) => () => void
}

export interface CassanovaVaultAPI {
  set: (id: InstanceId, record: VaultRecord) => Promise<void>
  delete: (id: InstanceId) => Promise<boolean>
  has: (id: InstanceId) => Promise<boolean>
  listIds: () => Promise<InstanceId[]>
  onChanged: (callback: () => void) => () => void
}

export interface CassanovaAuthAPI {
  login: (id: InstanceId) => Promise<LoginResult>
}

export interface CassanovaCertsAPI {
  respond: (response: CertPromptResponse) => Promise<void>
  revoke: (id: InstanceId) => Promise<void>
  onPrompt: (callback: (payload: CertPromptPayload) => void) => () => void
  onMismatch: (callback: (payload: CertMismatchPayload) => void) => () => void
}

export interface CassanovaUpdaterAPI {
  check: () => Promise<void>
  download: () => Promise<void>
  install: () => Promise<void>
  getStatus: () => Promise<UpdaterStatus>
  onStatus: (callback: (status: UpdaterStatus) => void) => () => void
}

export interface CassanovaAPI {
  instances: CassanovaInstancesAPI
  window: CassanovaWindowAPI
  app: CassanovaAppAPI
  vault: CassanovaVaultAPI
  auth: CassanovaAuthAPI
  certs: CassanovaCertsAPI
  updater: CassanovaUpdaterAPI
}
