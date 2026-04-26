const isMac = typeof process !== 'undefined' ? process.platform === 'darwin' : false

export interface ShortcutDef {
  id: string
  key: string
  label: string
  /** Electron menu accelerator string */
  accelerator: string
}

const mod = isMac ? '⌘' : 'Ctrl+'
const modKey = isMac ? 'CmdOrCtrl' : 'CmdOrCtrl'

export const shortcuts: ShortcutDef[] = [
  { id: 'newInstance', key: 'n', label: `${mod}N`, accelerator: `${modKey}+N` },
  { id: 'openSettings', key: ',', label: `${mod},`, accelerator: `${modKey}+,` },
  { id: 'commandPalette', key: 'k', label: `${mod}K`, accelerator: `${modKey}+K` },
  { id: 'toggleSidebar', key: 'b', label: `${mod}B`, accelerator: `${modKey}+B` },
  { id: 'reload', key: 'r', label: `${mod}R`, accelerator: `${modKey}+R` },
  { id: 'closeTab', key: 'w', label: `${mod}W`, accelerator: `${modKey}+W` },
  {
    id: 'detach',
    key: 'N',
    label: `${mod}Shift+N`,
    accelerator: `${modKey}+Shift+N`,
  },
]

export const shortcutMap = Object.fromEntries(
  shortcuts.map((s) => [s.id, s]),
) as Record<string, ShortcutDef>
