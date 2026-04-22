import { Logo } from '@/components/logo'
import { cn } from '@/lib/utils'

interface Props {
  collapsed?: boolean
}

export function SidebarBrand({ collapsed = false }: Props) {
  return (
    <div
      className={cn(
        'flex items-center pb-4 pt-5',
        collapsed ? 'justify-center px-2' : 'gap-3 px-5',
      )}
    >
      <Logo className="h-8 w-8 shrink-0" />
      {!collapsed && (
        <div className="min-w-0">
          <div className="truncate font-display text-sm font-semibold leading-none text-cass-text-primary">
            Cassanova
          </div>
          <div className="mt-1 truncate text-xs text-cass-text-muted">
            Desktop
          </div>
        </div>
      )}
    </div>
  )
}
