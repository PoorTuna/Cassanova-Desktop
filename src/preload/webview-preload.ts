/// <reference lib="dom" />
import { ipcRenderer } from 'electron'

// Channel literal kept inline — importing @shared/ipc-contract here would
// make Rollup split the shared module into chunks/, which sandboxed preloads
// cannot require. Must match IpcChannels.webviewThemeChanged.
const THEME_CHANGED_CHANNEL = 'webview:themeChanged'

const RELAYED_KEYS = new Set([
  'k',
  'b',
  'r',
  'i',
  ',',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '[',
  ']',
])

function relay(key: string, event: KeyboardEvent) {
  event.preventDefault()
  event.stopPropagation()
  ipcRenderer.sendToHost('shortcut', {
    key,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
    shiftKey: event.shiftKey,
    altKey: event.altKey,
  })
}

document.addEventListener(
  'keydown',
  (event: KeyboardEvent) => {
    if (event.key === 'F12') {
      relay('i', event)
      return
    }
    if (!(event.ctrlKey || event.metaKey)) return
    const key = event.key.toLowerCase()
    if (!RELAYED_KEYS.has(key)) return
    relay(key, event)
  },
  true,
)

// Reverse theme sync. The host pushes theme into the guest via injected
// script; if the user changes theme inside Cassanova's own settings UI, this
// watcher mirrors it back so the chrome stays in sync. Source of truth is
// localStorage.selectedTheme (id, including 'system'); the <html> class only
// carries the resolved family and would lose that distinction.
let lastKnownTheme: string | null = null

function readSelectedTheme(): string | null {
  try {
    return window.localStorage.getItem('selectedTheme')
  } catch {
    return null
  }
}

function maybeEmitTheme() {
  const value = readSelectedTheme()
  if (!value || value === lastKnownTheme) return
  lastKnownTheme = value
  ipcRenderer.sendToHost(THEME_CHANGED_CHANNEL, { theme: value })
}

function initThemeWatcher() {
  lastKnownTheme = readSelectedTheme()
  const html = document.documentElement
  if (html) {
    new MutationObserver(maybeEmitTheme).observe(html, {
      attributes: true,
      attributeFilter: ['class'],
    })
  }
  window.addEventListener('storage', (event) => {
    if (event.key === 'selectedTheme') maybeEmitTheme()
  })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initThemeWatcher, {
    once: true,
  })
} else {
  initThemeWatcher()
}
