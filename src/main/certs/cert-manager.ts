import { app, BrowserWindow, ipcMain } from 'electron'
import type { Certificate, WebContents } from 'electron'
import { randomUUID } from 'crypto'
import { IpcChannels } from '@shared/ipc-contract'
import type { CertPromptPayload, CertPromptResponse } from '@shared/ipc-contract'
import type { Instance } from '@shared/models'
import { instancesStore } from '../storage/instances-store'

interface PendingPrompt {
  promptId: string
  instanceId: string
  fingerprint: string
  resolve: (trust: boolean) => void
}

const pending = new Map<string, PendingPrompt>()
// In-flight requests for the same (instance, fingerprint) await the same prompt
// so a single page load with multiple subresources only prompts once.
const inflight = new Map<string, Promise<boolean>>()

function findInstanceByUrl(url: string): Instance | null {
  let host: string
  try {
    host = new URL(url).host
  } catch {
    return null
  }
  return (
    instancesStore.list().find((inst) => {
      try {
        return new URL(inst.url).host === host
      } catch {
        return false
      }
    }) ?? null
  )
}

function broadcastMismatch(instance: Instance, fingerprint: string): void {
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send(IpcChannels.certsMismatch, {
      instanceId: instance.id,
      instanceName: instance.name,
      url: instance.url,
      pinnedFingerprint: instance.pinnedCertFingerprint ?? '',
      seenFingerprint: fingerprint,
    })
  }
}

function promptRenderer(
  instance: Instance,
  certificate: Certificate,
  errorCode: string,
): Promise<boolean> {
  const key = `${instance.id}:${certificate.fingerprint}`
  const existing = inflight.get(key)
  if (existing) return existing

  const promise = new Promise<boolean>((resolve) => {
    const promptId = randomUUID()
    const payload: CertPromptPayload = {
      promptId,
      instanceId: instance.id,
      instanceName: instance.name,
      url: instance.url,
      errorCode,
      fingerprint: certificate.fingerprint,
      subjectCommonName: certificate.subject?.commonName ?? certificate.subjectName ?? '',
      issuerCommonName: certificate.issuer?.commonName ?? certificate.issuerName ?? '',
      validStart: certificate.validStart,
      validExpiry: certificate.validExpiry,
    }
    pending.set(promptId, {
      promptId,
      instanceId: instance.id,
      fingerprint: certificate.fingerprint,
      resolve,
    })
    const targets = BrowserWindow.getAllWindows()
    if (targets.length === 0) {
      pending.delete(promptId)
      resolve(false)
      return
    }
    for (const win of targets) {
      win.webContents.send(IpcChannels.certsPrompt, payload)
    }
  }).finally(() => {
    inflight.delete(key)
  })
  inflight.set(key, promise)
  return promise
}

export function registerCertHandlers(): void {
  app.on(
    'certificate-error',
    (
      event,
      _webContents: WebContents,
      url: string,
      error: string,
      certificate: Certificate,
      callback: (trust: boolean) => void,
    ) => {
      event.preventDefault()
      const instance = findInstanceByUrl(url)
      if (!instance) {
        callback(false)
        return
      }
      const fingerprint = certificate.fingerprint
      const pinned = instance.pinnedCertFingerprint
      if (pinned && pinned === fingerprint) {
        callback(true)
        return
      }
      if (pinned && pinned !== fingerprint) {
        broadcastMismatch(instance, fingerprint)
        callback(false)
        return
      }
      promptRenderer(instance, certificate, error)
        .then((trust) => {
          if (trust) {
            const updated: Instance = {
              ...instance,
              pinnedCertFingerprint: fingerprint,
              updatedAt: new Date().toISOString(),
            }
            instancesStore.upsert(updated)
            for (const win of BrowserWindow.getAllWindows()) {
              win.webContents.send(IpcChannels.instancesChanged, instancesStore.list())
            }
          }
          callback(trust)
        })
        .catch(() => callback(false))
    },
  )

  ipcMain.handle(
    IpcChannels.certsPromptResponse,
    (_event, response: CertPromptResponse) => {
      const entry = pending.get(response.promptId)
      if (!entry) return
      pending.delete(response.promptId)
      entry.resolve(response.trust)
    },
  )

  ipcMain.handle(IpcChannels.certsRevoke, (_event, instanceId: string) => {
    const instance = instancesStore.list().find((i) => i.id === instanceId)
    if (!instance || !instance.pinnedCertFingerprint) return
    const updated: Instance = {
      ...instance,
      pinnedCertFingerprint: undefined,
      updatedAt: new Date().toISOString(),
    }
    instancesStore.upsert(updated)
    for (const win of BrowserWindow.getAllWindows()) {
      win.webContents.send(IpcChannels.instancesChanged, instancesStore.list())
    }
  })
}
