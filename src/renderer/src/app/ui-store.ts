import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { isKnownTheme, SYSTEM_THEME } from '@shared/themes'

interface UiStore {
  paletteOpen: boolean
  sidebarCollapsed: boolean
  developerMode: boolean
  theme: string

  openPalette: () => void
  closePalette: () => void
  togglePalette: () => void
  setPaletteOpen: (open: boolean) => void

  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void

  setDeveloperMode: (enabled: boolean) => void
  setTheme: (theme: string) => void
}

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      paletteOpen: false,
      sidebarCollapsed: false,
      developerMode: false,
      theme: SYSTEM_THEME,

      openPalette: () => set({ paletteOpen: true }),
      closePalette: () => set({ paletteOpen: false }),
      togglePalette: () => set((s) => ({ paletteOpen: !s.paletteOpen })),
      setPaletteOpen: (open) => set({ paletteOpen: open }),

      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      setDeveloperMode: (enabled) => set({ developerMode: enabled }),
      setTheme: (theme) => {
        if (!isKnownTheme(theme)) return
        set({ theme })
      },
    }),
    {
      name: 'cassanova-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        sidebarCollapsed: s.sidebarCollapsed,
        developerMode: s.developerMode,
        theme: s.theme,
      }),
    },
  ),
)
