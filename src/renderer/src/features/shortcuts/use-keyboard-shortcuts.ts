import { useEffect } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { shortcutMap } from '@shared/shortcuts'
import { useInstanceStore } from '@/features/instances/instance-store'
import { webviewRegistry } from '@/features/instances/webview-registry'
import { useUiStore } from '@/app/ui-store'

const INSTANCE_ROUTE_PREFIX = '/instances/'

function isTypingInField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (target.isContentEditable) return true
  return false
}

function currentInstanceIdFromPath(pathname: string): string | null {
  if (!pathname.startsWith(INSTANCE_ROUTE_PREFIX)) return null
  const rest = pathname.slice(INSTANCE_ROUTE_PREFIX.length)
  const id = rest.split('/')[0]
  return id || null
}

export function useKeyboardShortcuts(): void {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return
      const key = event.key.toLowerCase()
      const typing = isTypingInField(event.target)

      if (key === shortcutMap.commandPalette.key) {
        event.preventDefault()
        useUiStore.getState().togglePalette()
        return
      }

      if (typing) return

      if (key === shortcutMap.toggleSidebar.key) {
        event.preventDefault()
        useUiStore.getState().toggleSidebar()
        return
      }

      if (key === shortcutMap.reload.key) {
        const id = currentInstanceIdFromPath(pathname)
        if (!id) return
        event.preventDefault()
        webviewRegistry.get(id)?.reload()
        return
      }

      if (key === shortcutMap.newInstance.key) {
        event.preventDefault()
        useInstanceStore.getState().openCreate()
        return
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [pathname])
}
