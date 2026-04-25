import { session as electronSession } from 'electron'
import type { Instance } from '@shared/models'
import type { LoginResult, VaultRecord } from '@shared/ipc-contract'
import { partitionForInstance } from '@shared/partition'

const LOGIN_PATH = '/login'

/**
 * POST credentials to the instance's /login endpoint using the partition session
 * so the returned httpOnly access_token cookie lands directly in the webview's
 * cookie jar. The renderer never sees the cookie or the password.
 */
export async function performLogin(
  instance: Instance,
  creds: VaultRecord,
): Promise<LoginResult> {
  const ses = electronSession.fromPartition(partitionForInstance(instance.id))
  const url = new URL(LOGIN_PATH, instance.url).toString()
  const body = new URLSearchParams({
    username: creds.username,
    password: creds.password,
  }).toString()

  try {
    const res = await ses.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    if (res.ok) return { ok: true }

    let message = `HTTP ${res.status}`
    try {
      const payload = (await res.json()) as { detail?: string }
      if (payload.detail) message = payload.detail
    } catch {
      // body wasn't JSON; keep status-based message
    }
    return { ok: false, status: res.status, message }
  } catch (err) {
    return {
      ok: false,
      status: 0,
      message: err instanceof Error ? err.message : 'Network error',
    }
  }
}
