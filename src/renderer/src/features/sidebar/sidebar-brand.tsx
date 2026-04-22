import { Logo } from '@/components/logo'

export function SidebarBrand() {
  return (
    <div className="flex items-center gap-3 px-5 pb-4 pt-5">
      <Logo className="h-8 w-8" />
      <div className="min-w-0">
        <div className="truncate font-display text-sm font-semibold leading-none text-cass-text-primary">
          Cassanova
        </div>
        <div className="mt-1 truncate text-xs text-cass-text-muted">Desktop</div>
      </div>
    </div>
  )
}
