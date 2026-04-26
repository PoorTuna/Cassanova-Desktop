import { useEffect } from 'react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import type { MenuAction } from '@shared/ipc-contract'
import { cassanova } from '@/lib/ipc'
import { useInstanceStore } from '@/features/instances/instance-store'
import { webviewRegistry } from '@/features/instances/webview-registry'
import { useUiStore } from '@/app/ui-store'

const INSTANCE_ROUTE_PREFIX = '/instances/'

function currentInstanceIdFromPath(pathname: string): string | null {
  if (!pathname.startsWith(INSTANCE_ROUTE_PREFIX)) return null
  const rest = pathname.slice(INSTANCE_ROUTE_PREFIX.length)
  const id = rest.split('/')[0]
  return id || null
}

export function MenuIpcBridge(): null {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  useEffect(() => {
    const handle = (action: MenuAction) => {
      if (action === 'newInstance') {
        useInstanceStore.getState().openCreate()
      } else if (action === 'openSettings') {
        navigate({ to: '/settings' }).catch(() => {})
      } else if (action === 'toggleSidebar') {
        useUiStore.getState().toggleSidebar()
      } else if (action === 'reload') {
        const id = currentInstanceIdFromPath(pathname)
        if (id) webviewRegistry.get(id)?.reload()
      } else if (action === 'detach') {
        const id = currentInstanceIdFromPath(pathname)
        if (id) cassanova().instances.openWindow(id).catch(() => {})
      }
    }
    return cassanova().app.onMenuAction(handle)
  }, [navigate, pathname])

  return null
}
