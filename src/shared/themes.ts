export type ThemeFamily = 'dark' | 'light'

export interface ThemeOption {
  id: string
  label: string
  family: ThemeFamily
  /** [bg, surface, accent, text] preview swatches matching Cassanova profile.html */
  swatches: [string, string, string, string]
}

export const SYSTEM_THEME = 'system'

export const DARK_THEMES: ThemeOption[] = [
  { id: 'dark', label: 'Dark', family: 'dark', swatches: ['#08080a', '#121216', '#1287b1', '#e1e1e6'] },
  { id: 'dracula', label: 'Dracula', family: 'dark', swatches: ['#282a36', '#44475a', '#bd93f9', '#f8f8f2'] },
  { id: 'monokai', label: 'Monokai', family: 'dark', swatches: ['#272822', '#2d2e27', '#f92672', '#f8f8f2'] },
  { id: 'nord', label: 'Nord', family: 'dark', swatches: ['#2e3440', '#3b4252', '#88c0d0', '#eceff4'] },
  { id: 'tokyo-night', label: 'Tokyo Night', family: 'dark', swatches: ['#1a1b26', '#24283b', '#7aa2f7', '#c0caf5'] },
  { id: 'catppuccin-mocha', label: 'Catppuccin Mocha', family: 'dark', swatches: ['#1e1e2e', '#313244', '#cba6f7', '#cdd6f4'] },
  { id: 'gruvbox-dark', label: 'Gruvbox Dark', family: 'dark', swatches: ['#1d2021', '#282828', '#fe8019', '#ebdbb2'] },
  { id: 'solarized-dark', label: 'Solarized Dark', family: 'dark', swatches: ['#002b36', '#073642', '#268bd2', '#eee8d5'] },
  { id: 'cubic', label: 'Cubic', family: 'dark', swatches: ['#1D1D1D', '#2E2E2E', '#52AA3F', '#e0e0e0'] },
  { id: 'neon-punk', label: 'Neon Punk', family: 'dark', swatches: ['#030305', '#14141e', '#FF007F', '#f0f0f0'] },
  { id: 'kubana-dark', label: 'Kubana Dark', family: 'dark', swatches: ['#1D1E24', '#2D2E34', '#DB1374', '#DFE5EF'] },
  { id: 'orokin-dark', label: 'Orokin Dark', family: 'dark', swatches: ['#0A0A0C', '#1E1E1E', '#D4AF37', '#e0dcd0'] },
  { id: 'fortress-blue', label: 'Fortress Blue', family: 'dark', swatches: ['#242220', '#302E2C', '#5b7a8c', '#d4cfc8'] },
  { id: 'fortress-red', label: 'Fortress Red', family: 'dark', swatches: ['#242220', '#302E2C', '#B8383B', '#d4cfc8'] },
  { id: 'cassandra-orange', label: 'Cassandra Orange', family: 'dark', swatches: ['#0c0c0e', '#161618', '#f0810f', '#e8e4e0'] },
  { id: 'midnight-purple', label: 'Midnight Purple', family: 'dark', swatches: ['#0f0a1a', '#1a1128', '#a855f7', '#e2ddf5'] },
  { id: 'matrix', label: 'Matrix', family: 'dark', swatches: ['#000000', '#0a0a0a', '#00ff41', '#00cc33'] },
]

export const LIGHT_THEMES: ThemeOption[] = [
  { id: 'light', label: 'Light', family: 'light', swatches: ['#F5F7FA', '#ffffff', '#0066FF', '#1A1D1F'] },
  { id: 'github-light', label: 'GitHub Light', family: 'light', swatches: ['#ffffff', '#f6f8fa', '#0969da', '#1f2328'] },
  { id: 'solarized-light', label: 'Solarized Light', family: 'light', swatches: ['#fdf6e3', '#eee8d5', '#268bd2', '#073642'] },
  { id: 'catppuccin-latte', label: 'Catppuccin Latte', family: 'light', swatches: ['#eff1f5', '#e6e9ef', '#8839ef', '#4c4f69'] },
  { id: 'kubana-light', label: 'Kubana Light', family: 'light', swatches: ['#F5F7FA', '#ffffff', '#00b3a4', '#343741'] },
  { id: 'orokin-light', label: 'Orokin Light', family: 'light', swatches: ['#F9FAFB', '#ffffff', '#D4AF37', '#2d2a1e'] },
]

export const ALL_THEMES: ThemeOption[] = [...DARK_THEMES, ...LIGHT_THEMES]

const THEME_FAMILY: Record<string, ThemeFamily> = Object.fromEntries(
  ALL_THEMES.map((t) => [t.id, t.family]),
)

export function isKnownTheme(id: string): boolean {
  return id === SYSTEM_THEME || id in THEME_FAMILY
}

export function resolveFamily(
  theme: string,
  prefersDark: boolean,
): ThemeFamily {
  if (theme === SYSTEM_THEME) return prefersDark ? 'dark' : 'light'
  return THEME_FAMILY[theme] ?? 'dark'
}

export function resolveTheme(
  theme: string,
  prefersDark: boolean,
): ThemeOption {
  const id = theme === SYSTEM_THEME ? (prefersDark ? 'dark' : 'light') : theme
  return ALL_THEMES.find((t) => t.id === id) ?? ALL_THEMES[0]
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const v =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h
  return [
    parseInt(v.slice(0, 2), 16),
    parseInt(v.slice(2, 4), 16),
    parseInt(v.slice(4, 6), 16),
  ]
}

function rgba(hex: string, a: number): string {
  const [r, g, b] = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

function shade(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex)
  const adjust = (c: number) =>
    Math.max(0, Math.min(255, Math.round(c + amount * 255)))
  const toHex = (c: number) => adjust(c).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * Derive a full set of `--cass-*` CSS variable values from a theme's four
 * swatches. Inline-style on <html> so they win over the `:root` and
 * `html.light` defaults in tokens.css. Lets chrome recolor per theme without
 * hand-writing 24 CSS blocks.
 */
export function themeCssVars(theme: ThemeOption): Record<string, string> {
  const [bg, surface, accent, text] = theme.swatches
  const isLight = theme.family === 'light'
  const sidebarShift = isLight ? -0.02 : 0.01
  const elevatedShift = isLight ? -0.01 : 0.025
  const borderAlpha = isLight ? 0.1 : 0.08
  const borderStrongAlpha = isLight ? 0.16 : 0.14
  const hoverAlpha = isLight ? 0.05 : 0.06
  const overlayBase = isLight ? '#000000' : '#ffffff'
  return {
    '--cass-bg-app': bg,
    '--cass-bg-sidebar': shade(bg, sidebarShift),
    '--cass-bg-surface': surface,
    '--cass-bg-elevated': shade(surface, elevatedShift),
    '--cass-bg-glass': rgba(overlayBase, isLight ? 0.03 : 0.02),
    '--cass-glass-border': rgba(overlayBase, isLight ? 0.08 : 0.06),
    '--cass-hover': rgba(overlayBase, hoverAlpha),
    '--cass-hover-active': rgba(overlayBase, hoverAlpha + 0.02),
    '--cass-pressed': rgba(overlayBase, hoverAlpha + 0.04),
    '--cass-brand-primary': accent,
    '--cass-brand-primary-hover': shade(accent, 0.08),
    '--cass-brand-primary-active': shade(accent, -0.08),
    '--cass-text-primary': text,
    '--cass-text-secondary': rgba(text, 0.72),
    '--cass-text-muted': rgba(text, 0.5),
    '--cass-text-subtle': rgba(text, 0.32),
    '--cass-border': rgba(text, borderAlpha),
    '--cass-border-strong': rgba(text, borderStrongAlpha),
  }
}
