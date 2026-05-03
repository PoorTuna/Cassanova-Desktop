import { resolveTheme, themeCssVars } from '@shared/themes'
import { cassanova } from '@/lib/ipc'
import { useUiStore } from './ui-store'

const PREFERS_DARK = '(prefers-color-scheme: dark)'

function pushChromeColors(theme: ReturnType<typeof resolveTheme>): void {
  const [bg, , , text] = theme.swatches
  try {
    cassanova().window.setChromeColors({
      background: bg,
      titleBarColor: bg,
      titleBarSymbolColor: text,
    })
  } catch {
    // Preload may not be ready on first paint; the next theme change retries.
  }
}

function applyTheme(theme: string, prefersDark: boolean): void {
  const resolved = resolveTheme(theme, prefersDark)
  const html = document.documentElement
  html.classList.toggle('dark', resolved.family === 'dark')
  html.classList.toggle('light', resolved.family === 'light')
  html.style.colorScheme = resolved.family

  const vars = themeCssVars(resolved)
  for (const [name, value] of Object.entries(vars)) {
    html.style.setProperty(name, value)
  }

  pushChromeColors(resolved)
}

export function startThemeBridge(): void {
  const media = window.matchMedia(PREFERS_DARK)

  const apply = (theme: string) => applyTheme(theme, media.matches)

  apply(useUiStore.getState().theme)
  useUiStore.subscribe((s, prev) => {
    if (s.theme !== prev.theme) apply(s.theme)
  })
  media.addEventListener('change', () => apply(useUiStore.getState().theme))
}
