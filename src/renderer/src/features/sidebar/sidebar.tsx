import { useMemo, useState } from 'react'
import { SidebarBrand } from './sidebar-brand'
import { SidebarSearch } from './sidebar-search'
import { SidebarFooter } from './sidebar-footer'
import { InstanceRow } from '@/features/instances/instance-row'
import { useInstanceStore } from '@/features/instances/instance-store'
import { useUiStore } from '@/app/ui-store'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const [query, setQuery] = useState('')
  const instances = useInstanceStore((s) => s.instances)
  const hydrated = useInstanceStore((s) => s.hydrated)
  const openCreate = useInstanceStore((s) => s.openCreate)
  const collapsed = useUiStore((s) => s.sidebarCollapsed)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return instances
    return instances.filter(
      (i) =>
        i.name.toLowerCase().includes(q) || i.url.toLowerCase().includes(q),
    )
  }, [instances, query])

  return (
    <aside
      className={cn(
        'flex h-full flex-col overflow-hidden border-r border-cass-border bg-cass-sidebar',
        'transition-[width] duration-300 ease-sidebar',
        collapsed ? 'w-sidebar-collapsed' : 'w-sidebar',
      )}
    >
      <SidebarBrand collapsed={collapsed} />
      {!collapsed && <SidebarSearch value={query} onChange={setQuery} />}
      <div className={cn('flex-1 overflow-y-auto pb-2', collapsed ? 'px-1.5' : 'px-2')}>
        {!hydrated ? null : filtered.length > 0 ? (
          <div className="flex flex-col gap-0.5">
            {filtered.map((instance) => (
              <InstanceRow
                key={instance.id}
                instance={instance}
                collapsed={collapsed}
              />
            ))}
          </div>
        ) : instances.length === 0 ? (
          !collapsed && <EmptyState />
        ) : (
          !collapsed && <NoMatchState query={query} />
        )}
      </div>
      <SidebarFooter onAdd={openCreate} collapsed={collapsed} />
    </aside>
  )
}

function EmptyState() {
  return (
    <div className="px-3 py-8 text-center text-xs text-cass-text-muted">
      No instances yet.
      <div className="mt-1 text-cass-text-subtle">
        Click &ldquo;Add instance&rdquo; below to get started.
      </div>
    </div>
  )
}

function NoMatchState({ query }: { query: string }) {
  return (
    <div className="px-3 py-8 text-center text-xs text-cass-text-muted">
      No instances match &ldquo;{query}&rdquo;.
    </div>
  )
}
