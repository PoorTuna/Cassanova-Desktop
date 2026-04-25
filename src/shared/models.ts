export type InstanceId = string

export type AuthType = 'local' | 'ldap'

export type InstanceStatus =
  | 'unknown'
  | 'reachable'
  | 'healthy'
  | 'auth-expired'
  | 'unreachable'

export interface Instance {
  id: InstanceId
  name: string
  url: string
  authType: AuthType
  /** SHA-256 fingerprint of the TLS cert trusted for this instance (for self-signed deployments). */
  pinnedCertFingerprint?: string
  /** Last observed status. Live status comes from the health poller. */
  lastStatus?: InstanceStatus
  /** ISO timestamp of the last health probe. */
  lastCheckedAt?: string
  createdAt: string
  updatedAt: string
}
