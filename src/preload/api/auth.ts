import { ipcRenderer } from 'electron'
import { IpcChannels } from '@shared/ipc-contract'
import type { LoginResult } from '@shared/ipc-contract'
import type { InstanceId } from '@shared/models'

export const authApi = {
  login: (id: InstanceId): Promise<LoginResult> =>
    ipcRenderer.invoke(IpcChannels.authLogin, id),
}
