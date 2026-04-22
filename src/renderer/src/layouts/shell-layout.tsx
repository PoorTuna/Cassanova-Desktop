import { Outlet } from '@tanstack/react-router'
import { TitleBar } from '@/features/titlebar/titlebar'
import { Sidebar } from '@/features/sidebar/sidebar'

export function ShellLayout() {
  return (
    <div className="flex h-screen flex-col bg-cass-app text-cass-text-primary">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
