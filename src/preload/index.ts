import { contextBridge } from 'electron'
import { instancesApi } from './api/instances'
import { windowApi } from './api/window'
import { appApi } from './api/app'
import type { CassanovaAPI } from './types'

const api: CassanovaAPI = {
  instances: instancesApi,
  window: windowApi,
  app: appApi,
}

try {
  contextBridge.exposeInMainWorld('cassanova', api)
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('Failed to expose cassanova API via contextBridge:', error)
}
