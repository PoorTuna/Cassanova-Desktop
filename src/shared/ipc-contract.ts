import type { Instance, InstanceId } from './models'

/**
 * Channel names for main<->renderer IPC. Single source of truth — both sides import from here.
 */
export const IpcChannels = {
  instancesList: 'instances:list',
  instancesUpsert: 'instances:upsert',
  instancesDelete: 'instances:delete',
  vaultGet: 'vault:get',
  vaultSet: 'vault:set',
  vaultDelete: 'vault:delete',
  certsTrust: 'certs:trust',
  certsList: 'certs:list',
} as const

export interface VaultRecord {
  username: string
  password: string
}

export interface IpcSurface {
  [IpcChannels.instancesList]: () => Promise<Instance[]>
  [IpcChannels.instancesUpsert]: (instance: Instance) => Promise<Instance>
  [IpcChannels.instancesDelete]: (id: InstanceId) => Promise<void>
  [IpcChannels.vaultGet]: (id: InstanceId) => Promise<VaultRecord | null>
  [IpcChannels.vaultSet]: (id: InstanceId, record: VaultRecord) => Promise<void>
  [IpcChannels.vaultDelete]: (id: InstanceId) => Promise<void>
}
