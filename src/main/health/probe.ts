import { session as electronSession } from 'electron'
import type { Instance, InstanceStatus } from '@shared/models'
import { partitionForInstance } from '@shared/partition'

const PROBE_TIMEOUT_MS = 5000

/**
 * GET the instance root with the partition session so the access_token cookie
 * (when present) is sent. Cassanova returns the dashboard for authed sessions
 * and redirects unauthed sessions to /login — that distinction maps to
 * healthy vs reachable. Network errors map to unreachable.
 */
export async function probeInstance(instance: Instance): Promise<InstanceStatus> {
  const ses = electronSession.fromPartition(partitionForInstance(instance.id))
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS)
  try {
    const res = await ses.fetch(instance.url, {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
    })
    if (res.status === 200) return 'healthy'
    if (res.status === 401 || res.status === 403) return 'auth-expired'
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location') ?? ''
      if (location.includes('/login')) return 'reachable'
      return 'reachable'
    }
    if (res.status >= 500) return 'unreachable'
    return 'reachable'
  } catch {
    return 'unreachable'
  } finally {
    clearTimeout(timer)
  }
}
