import { BrowserWindow } from 'electron'
import type { Instance, InstanceId, InstanceStatus } from '@shared/models'
import { IpcChannels } from '@shared/ipc-contract'
import { instancesStore } from '../storage/instances-store'
import { probeInstance } from './probe'

const POLL_INTERVAL_MS = 30_000
const STARTUP_DELAY_MS = 2_000

interface Tracked {
  timer: NodeJS.Timeout
  inflight: Promise<void> | null
  lastStatus?: InstanceStatus
}

const tracked = new Map<InstanceId, Tracked>()
let started = false

function broadcastInstances(): void {
  const list = instancesStore.list()
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send(IpcChannels.instancesChanged, list)
  }
}

async function probeOnce(id: InstanceId): Promise<void> {
  const instance = instancesStore.list().find((i) => i.id === id)
  if (!instance) return
  const status = await probeInstance(instance)
  const now = new Date().toISOString()
  const next: Instance = {
    ...instance,
    lastStatus: status,
    lastCheckedAt: now,
  }
  // Persist + broadcast. instancesStore.upsert handles file write atomically.
  instancesStore.upsert(next)
  const entry = tracked.get(id)
  if (entry) entry.lastStatus = status
  broadcastInstances()
}

function startTracking(id: InstanceId, delayMs: number): void {
  if (tracked.has(id)) return
  const entry: Tracked = { timer: setTimeout(tick, delayMs), inflight: null }
  tracked.set(id, entry)

  function tick() {
    if (!tracked.has(id)) return
    if (entry.inflight) {
      entry.timer = setTimeout(tick, POLL_INTERVAL_MS)
      return
    }
    entry.inflight = probeOnce(id)
      .catch(() => {
        /* swallow; probe already maps errors to status */
      })
      .finally(() => {
        entry.inflight = null
        if (tracked.has(id)) {
          entry.timer = setTimeout(tick, POLL_INTERVAL_MS)
        }
      })
  }
}

function stopTracking(id: InstanceId): void {
  const entry = tracked.get(id)
  if (!entry) return
  clearTimeout(entry.timer)
  tracked.delete(id)
}

function syncTrackedSet(): void {
  const ids = new Set(instancesStore.list().map((i) => i.id))
  // Remove pollers for instances no longer in the store.
  for (const id of tracked.keys()) {
    if (!ids.has(id)) stopTracking(id)
  }
  // Add pollers for new instances. Stagger startup to avoid a thundering herd.
  let delay = STARTUP_DELAY_MS
  for (const id of ids) {
    if (!tracked.has(id)) {
      startTracking(id, delay)
      delay += 250
    }
  }
}

export function startHealthPoller(): void {
  if (started) return
  started = true
  syncTrackedSet()
  instancesStore.on('changed', () => syncTrackedSet())
}
