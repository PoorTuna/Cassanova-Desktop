import { useEffect } from 'react'
import { Outlet } from '@tanstack/react-router'
import { toast } from 'sonner'
import { TitleBar } from '@/features/titlebar/titlebar'
import { Sidebar } from '@/features/sidebar/sidebar'
import { InstanceDialog } from '@/features/instances/instance-dialog'
import { DeleteConfirmDialog } from '@/features/instances/delete-confirm-dialog'
import { useInstanceStore } from '@/features/instances/instance-store'

export function ShellLayout() {
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
        <main className="flex-1 overflow-hidden bg-background">
          <Outlet />
        </main>
      </div>
      <InstanceDialog />
      <DeleteConfirmDialog />
    </div>
  )
}
