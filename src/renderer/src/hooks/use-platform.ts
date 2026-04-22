import { useEffect, useState } from 'react'
import { cassanova } from '@/lib/ipc'

export function usePlatform(): NodeJS.Platform | null {
  const [platform, setPlatform] = useState<NodeJS.Platform | null>(null)

  useEffect(() => {
    cassanova()
      .app.platform()
      .then(setPlatform)
      .catch(() => setPlatform(null))
  }, [])

  return platform
}
