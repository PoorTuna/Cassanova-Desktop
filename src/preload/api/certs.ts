import { ipcRenderer } from 'electron'
import { IpcChannels } from '@shared/ipc-contract'
import type {
  CertMismatchPayload,
  CertPromptPayload,
  CertPromptResponse,
} from '@shared/ipc-contract'
import type { InstanceId } from '@shared/models'

export const certsApi = {
  respond: (response: CertPromptResponse): Promise<void> =>
    ipcRenderer.invoke(IpcChannels.certsPromptResponse, response),
  revoke: (id: InstanceId): Promise<void> =>
    ipcRenderer.invoke(IpcChannels.certsRevoke, id),
  onPrompt: (callback: (payload: CertPromptPayload) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: CertPromptPayload) =>
      callback(payload)
    ipcRenderer.on(IpcChannels.certsPrompt, handler)
    return () => {
      ipcRenderer.removeListener(IpcChannels.certsPrompt, handler)
    }
  },
  onMismatch: (callback: (payload: CertMismatchPayload) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: CertMismatchPayload) =>
      callback(payload)
    ipcRenderer.on(IpcChannels.certsMismatch, handler)
    return () => {
      ipcRenderer.removeListener(IpcChannels.certsMismatch, handler)
    }
  },
}
