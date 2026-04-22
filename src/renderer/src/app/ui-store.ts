import { create } from 'zustand'

interface UiStore {
  paletteOpen: boolean
  sidebarCollapsed: boolean

  openPalette: () => void
  closePalette: () => void
  togglePalette: () => void
  setPaletteOpen: (open: boolean) => void

  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const useUiStore = create<UiStore>((set) => ({
  paletteOpen: false,
  sidebarCollapsed: false,

  openPalette: () => set({ paletteOpen: true }),
  closePalette: () => set({ paletteOpen: false }),
  togglePalette: () => set((s) => ({ paletteOpen: !s.paletteOpen })),
  setPaletteOpen: (open) => set({ paletteOpen: open }),

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
}))
