import type { Instance, InstanceId } from './models'
import type { LoginResult, MenuAction, VaultRecord } from './ipc-contract'

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

export interface CassanovaAPI {
  instances: CassanovaInstancesAPI
  window: CassanovaWindowAPI
  app: CassanovaAppAPI
  vault: CassanovaVaultAPI
  auth: CassanovaAuthAPI
}
