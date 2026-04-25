import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Bug, Copy, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import type { Instance } from '@shared/models'
import { Button } from '@/components/ui/button'
import { TitleBar } from '@/features/titlebar/titlebar'
import {
  InstanceWebview,
  type InstanceWebviewHandle,
} from '@/features/instances/instance-webview'
import { useUiStore } from '@/app/ui-store'
import { cassanova } from '@/lib/ipc'

interface Props {
  instanceId: string
}

export function DetachedLayout({ instanceId }: Props) {
  const [instance, setInstance] = useState<Instance | null>(null)
  const [missing, setMissing] = useState(false)
  const developerMode = useUiStore((s) => s.developerMode)
  const webviewRef = useRef<InstanceWebviewHandle>(null)

  useEffect(() => {
    let mounted = true
    const api = cassanova().instances
    const apply = (list: Instance[]) => {
      const found = list.find((i) => i.id === instanceId) ?? null
      if (!mounted) return
      setInstance(found)
      setMissing(found === null)
    }
    api.list().then(apply).catch(() => {})
    const unsub = api.onChanged(apply)
    return () => {
      mounted = false
      unsub()
    }
  }, [instanceId])

  if (missing) {
    return (
      <div className="flex h-screen flex-col bg-cass-app text-cass-text-primary">
        <TitleBar />
        <div className="flex flex-1 items-center justify-center p-8">
          <p className="font-display text-sm text-cass-text-muted">
            Instance no longer exists.
          </p>
        </div>
      </div>
    )
  }

  if (!instance) {
    return <div className="h-screen bg-cass-app" />
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
    <div className="flex h-screen flex-col bg-cass-app text-cass-text-primary">
      <TitleBar />
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-cass-border bg-cass-surface px-4">
        <h1 className="font-display text-sm font-medium">{instance.name}</h1>
        <button
          type="button"
          onClick={onCopyUrl}
          title="Copy URL"
          className="group flex min-w-0 items-center gap-1.5 rounded-sm px-1.5 py-0.5 font-mono text-[11px] text-cass-text-muted transition-colors hover:bg-cass-hover hover:text-cass-text-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cass-brand-primary/40"
        >
          <span className="truncate">{instance.url}</span>
          <Copy className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
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
          {developerMode && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => webviewRef.current?.openDevTools()}
              title="Inspect webview"
            >
              <Bug className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        <InstanceWebview key={instance.id} ref={webviewRef} instance={instance} />
      </div>
    </div>
  )
}
