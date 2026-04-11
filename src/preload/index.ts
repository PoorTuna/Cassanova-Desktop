import { contextBridge } from 'electron'

// Placeholder bridge. Phase 2 expands this with vault/instance/cert surfaces.
const api = {
  platform: process.platform,
} as const

try {
  contextBridge.exposeInMainWorld('cassanova', api)
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('Failed to expose cassanova API via contextBridge:', error)
}

export type CassanovaAPI = typeof api
