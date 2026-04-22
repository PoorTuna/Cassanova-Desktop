import { useEffect, useRef } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { ArrowUpRight, Copy, Pencil, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useInstanceStore } from '@/features/instances/instance-store'
import {
  InstanceWebview,
  type InstanceWebviewHandle,
} from '@/features/instances/instance-webview'
import { webviewRegistry } from '@/features/instances/webview-registry'
import { useUiStore } from '@/app/ui-store'
import { cassanova } from '@/lib/ipc'

export function InstanceDetail() {
  const params = useParams({ strict: false }) as { instanceId?: string }
  const hydrated = useInstanceStore((s) => s.hydrated)
  const instance = useInstanceStore((s) =>
    s.instances.find((i) => i.id === params.instanceId),
  )
  const openEdit = useInstanceStore((s) => s.openEdit)
  const togglePalette = useUiStore((s) => s.togglePalette)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const navigate = useNavigate()
  const webviewRef = useRef<InstanceWebviewHandle>(null)

  const instanceId = instance?.id
  useEffect(() => {
    if (!instanceId) return
    const handle: InstanceWebviewHandle = {
      reload: () => webviewRef.current?.reload(),
    }
    return webviewRegistry.register(instanceId, handle)
  }, [instanceId])

  const onWebviewShortcut = (key: string) => {
    if (key === 'k') togglePalette()
    else if (key === 'b') toggleSidebar()
    else if (key === 'r') webviewRef.current?.reload()
  }

  if (!hydrated) {
    return null
  }

  if (!instance) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <p className="mb-2 font-display text-lg font-medium">
            Instance not found
          </p>
          <p className="mb-4 text-sm text-cass-text-muted">
            It may have been removed in another window.
          </p>
          <Button onClick={() => navigate({ to: '/' }).catch(() => {})}>
            Go home
          </Button>
        </div>
      </div>
    )
  }

  const onCopyUrl = () => {
    navigator.clipboard
      .writeText(instance.url)
      .then(() => toast.success('URL copied'))
      .catch(() => toast.error('Could not copy URL'))
  }

  const onOpenExternal = () => {
    cassanova()
      .app.openExternal(instance.url)
      .catch((err: unknown) => {
        toast.error(err instanceof Error ? err.message : 'Failed to open')
      })
  }

  return (
    <div className="flex h-full flex-col bg-cass-app">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-cass-border bg-cass-surface px-4">
        <h1 className="font-display text-sm font-medium text-cass-text-primary">
          {instance.name}
        </h1>
        <button
          type="button"
          onClick={onCopyUrl}
          title="Copy URL"
          className="group flex min-w-0 items-center gap-1.5 rounded-sm px-1.5 py-0.5 font-mono text-[11px] text-cass-text-muted transition-colors hover:bg-cass-hover hover:text-cass-text-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cass-brand-primary/40"
        >
          <span className="truncate">{instance.url}</span>
          <Copy className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
        <Badge
          variant="secondary"
          className="ml-1 gap-1.5 border-cass-border bg-cass-app text-[10px] font-medium text-cass-text-muted"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-cass-text-subtle" />
          Not connected
        </Badge>
        <div className="ml-auto flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => webviewRef.current?.reload()}
            title="Reload"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={onOpenExternal}
            title="Open in browser"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => openEdit(instance)}
            title="Edit instance"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        <InstanceWebview
          key={instance.id}
          ref={webviewRef}
          instance={instance}
          onShortcut={onWebviewShortcut}
        />
      </div>
    </div>
  )
}
