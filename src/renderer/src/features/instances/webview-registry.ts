import type { InstanceWebviewHandle } from './instance-webview'

const handles = new Map<string, InstanceWebviewHandle>()

export const webviewRegistry = {
  register(instanceId: string, handle: InstanceWebviewHandle): () => void {
    handles.set(instanceId, handle)
    return () => {
      if (handles.get(instanceId) === handle) {
        handles.delete(instanceId)
      }
    }
  },
  get(instanceId: string): InstanceWebviewHandle | undefined {
    return handles.get(instanceId)
  },
}
