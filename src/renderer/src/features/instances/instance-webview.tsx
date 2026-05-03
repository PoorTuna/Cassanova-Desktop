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
import { IpcChannels } from '@shared/ipc-contract'
import { isKnownTheme, resolveFamily } from '@shared/themes'
import { Button } from '@/components/ui/button'
import { cassanova } from '@/lib/ipc'
import { useUiStore } from '@/app/ui-store'
import { partitionForInstance } from './partition'

export interface InstanceWebviewHandle {
  reload: () => void
  openDevTools: () => void
}

interface Props {
  instance: Instance
  onShortcut?: (key: string) => void
}

type LoadState =
  | { kind: 'loading' }
  | { kind: 'ready' }
  | { kind: 'error'; description: string }

// Module-level cache so the second mount onward is synchronous and the
// webview tag always has its preload attribute on first paint.
let cachedPreloadPath: string | null = null
let preloadPathPromise: Promise<string> | null = null

function getPreloadPath(): Promise<string> {
  if (cachedPreloadPath !== null) return Promise.resolve(cachedPreloadPath)
  if (!preloadPathPromise) {
    preloadPathPromise = cassanova()
      .app.webviewPreloadPath()
      .then((path) => {
        cachedPreloadPath = path
        return path
      })
      .catch(() => {
        cachedPreloadPath = ''
        return ''
      })
  }
  return preloadPathPromise
}

export const InstanceWebview = forwardRef<InstanceWebviewHandle, Props>(
  function InstanceWebview({ instance, onShortcut }, ref) {
    const webviewRef = useRef<WebviewTag | null>(null)
    const [preloadPath, setPreloadPath] = useState<string | null>(
      cachedPreloadPath,
    )
    const [state, setState] = useState<LoadState>({ kind: 'loading' })

    useEffect(() => {
      if (cachedPreloadPath !== null) return
      let mounted = true
      getPreloadPath().then((path) => {
        if (mounted) setPreloadPath(path)
      })
      return () => {
        mounted = false
      }
    }, [])

    // Fire-and-forget auth: if creds exist, post them so the cookie lands in
    // the partition session. If the webview already navigated to /login by
    // the time login resolves, reload so the server hands back the dashboard.
    useEffect(() => {
      let mounted = true
      const api = cassanova()
      ;(async () => {
        const hasCreds = await api.vault.has(instance.id).catch(() => false)
        if (!mounted || !hasCreds) return
        const result = await api.auth.login(instance.id).catch(() => null)
        if (!mounted || !result?.ok) return
        const el = webviewRef.current
        if (!el) return
        try {
          const current = el.getURL()
          if (current.includes('/login')) el.reload()
        } catch {
          // getURL throws before the guest attaches; the initial load will
          // already pick up the freshly-set cookie.
        }
      })()
      return () => {
        mounted = false
      }
    }, [instance.id])

    useEffect(() => {
      const el = webviewRef.current
      if (!el) return

      const isReady = () => {
        try {
          return !el.isLoading()
        } catch {
          return false
        }
      }

      const pushTheme = () => {
        if (!isReady()) return
        const theme = useUiStore.getState().theme
        const family = resolveFamily(
          theme,
          window.matchMedia('(prefers-color-scheme: dark)').matches,
        )
        el.executeJavaScript(buildThemeScript(theme, family)).catch(() => {})
      }

      const markReady = () => {
        setState((prev) =>
          prev.kind === 'error' || prev.kind === 'ready' ? prev : { kind: 'ready' },
        )
      }
      const onDomReady = () => {
        markReady()
        // Windows forced-colors mode (high-contrast / nativeTheme=dark interaction)
        // can override inline background colors on embedded pages. Opt the webview
        // out so inline styles like <span style="background:#XXX"> render as authored.
        el.insertCSS(
          ':root { forced-color-adjust: none; } *, *::before, *::after { forced-color-adjust: none !important; }',
        ).catch(() => {})
        pushTheme()
      }
      const onFail = (event: Electron.DidFailLoadEvent) => {
        if (event.errorCode === -3) return
        if (event.isMainFrame === false) return
        setState({
          kind: 'error',
          description: event.errorDescription || 'Failed to load',
        })
      }
      const onIpc = (event: Electron.IpcMessageEvent) => {
        if (event.channel === 'shortcut') {
          const payload = event.args[0] as { key?: string } | undefined
          if (payload?.key) onShortcut?.(payload.key)
          return
        }
        if (event.channel === IpcChannels.webviewThemeChanged) {
          const payload = event.args[0] as { theme?: string } | undefined
          const next = payload?.theme
          if (!next || !isKnownTheme(next)) return
          if (useUiStore.getState().theme === next) return
          useUiStore.getState().setTheme(next)
        }
      }

      el.addEventListener('did-stop-loading', markReady)
      el.addEventListener('did-finish-load', markReady)
      el.addEventListener('dom-ready', onDomReady)
      el.addEventListener('did-fail-load', onFail)
      el.addEventListener('ipc-message', onIpc)

      const unsubscribeTheme = useUiStore.subscribe((s, prev) => {
        if (s.theme !== prev.theme) pushTheme()
      })
      const media = window.matchMedia('(prefers-color-scheme: dark)')
      media.addEventListener('change', pushTheme)

      try {
        if (!el.isLoading()) markReady()
      } catch {
        // isLoading() throws before the guest attaches.
      }

      return () => {
        el.removeEventListener('did-stop-loading', markReady)
        el.removeEventListener('did-finish-load', markReady)
        el.removeEventListener('dom-ready', onDomReady)
        el.removeEventListener('did-fail-load', onFail)
        el.removeEventListener('ipc-message', onIpc)
        unsubscribeTheme()
        media.removeEventListener('change', pushTheme)
      }
    }, [onShortcut])

    useImperativeHandle(
      ref,
      () => ({
        reload: () => {
          webviewRef.current?.reload()
        },
        openDevTools: () => {
          const el = webviewRef.current
          if (!el) return
          if (el.isDevToolsOpened()) el.closeDevTools()
          else el.openDevTools()
        },
      }),
      [],
    )

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

function buildThemeScript(theme: string, family: 'dark' | 'light'): string {
  // Runs inside the webview. Authoritative DOM ops first (so the live press
  // always lands), then call Cassanova's window.applyTheme for any extra
  // internal state it tracks. localStorage write keeps reloads consistent.
  const safeTheme = JSON.stringify(theme)
  const safeFamily = JSON.stringify(family)
  return `(function() {
    try {
      var t = ${safeTheme};
      var fam = ${safeFamily};
      var cls = t === 'system' ? (fam + '-theme') : (t + '-theme');
      try { localStorage.setItem('selectedTheme', t); } catch (_) {}
      var html = document.documentElement;
      html.style.colorScheme = fam;
      Array.from(html.classList).forEach(function(c) {
        if (c.endsWith('-theme')) html.classList.remove(c);
      });
      html.classList.add(cls);
      if (typeof window.applyTheme === 'function') {
        try { window.applyTheme(t); } catch (_) {}
      }
    } catch (_) {}
  })();`
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
          Connection failed
        </p>
        <p className="mb-1 break-all font-mono text-xs text-cass-text-muted">
          {url}
        </p>
        <p className="mb-6 text-xs text-cass-text-subtle">{description}</p>
        <Button onClick={onRetry} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      </div>
    </div>
  )
}
