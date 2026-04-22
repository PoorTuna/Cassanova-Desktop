/* eslint-disable react/no-unknown-property */
// Electron <webview> tag exposes attributes (partition, allowpopups,
// webpreferences, preload) that react/no-unknown-property doesn't recognize.
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { RefreshCw } from 'lucide-react'
import type { WebviewTag } from 'electron'
import type { Instance } from '@shared/models'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { cassanova } from '@/lib/ipc'
import { partitionForInstance } from './partition'

export interface InstanceWebviewHandle {
  reload: () => void
}

interface Props {
  instance: Instance
  onShortcut?: (key: string) => void
}

type LoadState =
  | { kind: 'loading' }
  | { kind: 'ready' }
  | { kind: 'error'; description: string }

export const InstanceWebview = forwardRef<InstanceWebviewHandle, Props>(
  function InstanceWebview({ instance, onShortcut }, ref) {
    const webviewRef = useRef<WebviewTag | null>(null)
    const [preloadPath, setPreloadPath] = useState<string | null>(null)
    const [state, setState] = useState<LoadState>({ kind: 'loading' })

    useEffect(() => {
      let mounted = true
      cassanova()
        .app.webviewPreloadPath()
        .then((path) => {
          if (mounted) setPreloadPath(path)
        })
        .catch(() => {
          if (mounted) setPreloadPath('')
        })
      return () => {
        mounted = false
      }
    }, [])

    useEffect(() => {
      const el = webviewRef.current
      if (!el) return

      const onStart = () => setState({ kind: 'loading' })
      const onStop = () =>
        setState((prev) => (prev.kind === 'error' ? prev : { kind: 'ready' }))
      const onFail = (event: Electron.DidFailLoadEvent) => {
        if (event.errorCode === -3) return
        if (event.isMainFrame === false) return
        setState({
          kind: 'error',
          description: event.errorDescription || 'Failed to load',
        })
      }
      const onIpc = (event: Electron.IpcMessageEvent) => {
        if (event.channel !== 'shortcut') return
        const payload = event.args[0] as { key?: string } | undefined
        if (payload?.key) onShortcut?.(payload.key)
      }

      el.addEventListener('did-start-loading', onStart)
      el.addEventListener('did-stop-loading', onStop)
      el.addEventListener('did-fail-load', onFail)
      el.addEventListener('ipc-message', onIpc)
      return () => {
        el.removeEventListener('did-start-loading', onStart)
        el.removeEventListener('did-stop-loading', onStop)
        el.removeEventListener('did-fail-load', onFail)
        el.removeEventListener('ipc-message', onIpc)
      }
    }, [preloadPath, onShortcut])

    useImperativeHandle(
      ref,
      () => ({
        reload: () => {
          const el = webviewRef.current
          if (!el) return
          setState({ kind: 'loading' })
          el.reload()
        },
      }),
      [],
    )

    if (preloadPath === null) {
      return <FullSkeleton />
    }

    return (
      <div className="relative h-full w-full bg-cass-app">
        <webview
          ref={webviewRef}
          src={instance.url}
          partition={partitionForInstance(instance.id)}
          allowpopups=""
          webpreferences="contextIsolation=yes"
          preload={preloadPath || undefined}
          style={{
            display: state.kind === 'error' ? 'none' : 'inline-flex',
            height: '100%',
            width: '100%',
          }}
        />
        {state.kind === 'loading' && <FullSkeleton overlay />}
        {state.kind === 'error' && (
          <ErrorState
            url={instance.url}
            description={state.description}
            onRetry={() => {
              setState({ kind: 'loading' })
              webviewRef.current?.reload()
            }}
          />
        )}
      </div>
    )
  },
)

function FullSkeleton({ overlay = false }: { overlay?: boolean }) {
  return (
    <div
      className={
        overlay
          ? 'absolute inset-0 flex items-center justify-center bg-cass-app/95'
          : 'flex h-full w-full items-center justify-center bg-cass-app'
      }
    >
      <div className="w-72 space-y-3">
        <Skeleton className="h-6 w-2/3 bg-cass-hover" />
        <Skeleton className="h-4 w-full bg-cass-hover" />
        <Skeleton className="h-4 w-5/6 bg-cass-hover" />
        <Skeleton className="h-4 w-3/4 bg-cass-hover" />
      </div>
    </div>
  )
}

function ErrorState({
  url,
  description,
  onRetry,
}: {
  url: string
  description: string
  onRetry: () => void
}) {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="max-w-md text-center">
        <p className="mb-1 font-display text-lg font-medium">
          Couldn&rsquo;t reach this instance
        </p>
        <p className="mb-1 break-all font-mono text-xs text-cass-text-muted">
          {url}
        </p>
        <p className="mb-6 text-xs text-cass-text-subtle">{description}</p>
        <Button onClick={onRetry} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </Button>
      </div>
    </div>
  )
}
