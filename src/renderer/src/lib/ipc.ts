import type { CassanovaAPI } from '@shared/cassanova-api'

declare global {
  interface Window {
    cassanova: CassanovaAPI
  }
}

export function cassanova(): CassanovaAPI {
  if (typeof window === 'undefined' || !window.cassanova) {
    throw new Error(
      'window.cassanova is not available — preload script did not mount. Check electron.vite.config.ts and preload/index.ts.',
    )
  }
  return window.cassanova
}
