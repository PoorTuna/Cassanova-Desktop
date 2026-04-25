import keytar from 'keytar'
import { app } from 'electron'
import type { InstanceId } from '@shared/models'
import type { VaultRecord } from '@shared/ipc-contract'

// keytar stores one entry per (service, account). One service for the whole app,
// account = instance id, payload = JSON {username, password}.
const SERVICE = `${app.getName()}.vault`

export const vault = {
  async get(id: InstanceId): Promise<VaultRecord | null> {
    const raw = await keytar.getPassword(SERVICE, id)
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw) as VaultRecord
      if (typeof parsed.username !== 'string' || typeof parsed.password !== 'string') {
        return null
      }
      return parsed
    } catch {
      return null
    }
  },

  async set(id: InstanceId, record: VaultRecord): Promise<void> {
    await keytar.setPassword(SERVICE, id, JSON.stringify(record))
  },

  async delete(id: InstanceId): Promise<boolean> {
    return keytar.deletePassword(SERVICE, id)
  },

  async has(id: InstanceId): Promise<boolean> {
    const raw = await keytar.getPassword(SERVICE, id)
    return raw !== null
  },

  async listIds(): Promise<InstanceId[]> {
    const creds = await keytar.findCredentials(SERVICE)
    return creds.map((c) => c.account)
  },
}
