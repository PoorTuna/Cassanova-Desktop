import { useEffect, useState } from 'react'
import { cassanova } from '@/lib/ipc'

export function useIsMaximized(): boolean {
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    cassanova().window.isMaximized().then(setMaximized)
    const unsubscribe = cassanova().window.onMaximizeChanged(setMaximized)
    return unsubscribe
  }, [])

  return maximized
}
