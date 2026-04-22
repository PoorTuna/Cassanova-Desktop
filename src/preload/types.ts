import type { CassanovaAPI } from '@shared/cassanova-api'

export type { CassanovaAPI }

declare global {
  interface Window {
    cassanova: CassanovaAPI
  }
}
