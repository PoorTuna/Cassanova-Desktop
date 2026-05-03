import { useEffect } from 'react'
import { Outlet, useRouterState } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import { TitleBar } from '@/features/titlebar/titlebar'
import { Sidebar } from '@/features/sidebar/sidebar'
import { InstanceDialog } from '@/features/instances/instance-dialog'
import { DeleteConfirmDialog } from '@/features/instances/delete-confirm-dialog'
import { useInstanceStore } from '@/features/instances/instance-store'
import { CommandPalette } from '@/features/command-palette/command-palette'
import { useKeyboardShortcuts } from '@/features/shortcuts/use-keyboard-shortcuts'
import { MenuIpcBridge } from '@/app/menu-ipc-bridge'

export function ShellLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  useKeyboardShortcuts()

  useEffect(() => {
    useInstanceStore
      .getState()
      .hydrate()
      .catch((err: unknown) => {
        toast.error(
          err instanceof Error ? err.message : 'Failed to load instances',
        )
      })
  }, [])

  return (
    <div className="flex h-screen flex-col bg-cass-app text-cass-text-primary">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="relative flex-1 overflow-hidden bg-cass-app">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              className="h-full w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <InstanceDialog />
      <DeleteConfirmDialog />
      <CommandPalette />
      <MenuIpcBridge />
    </div>
  )
}
