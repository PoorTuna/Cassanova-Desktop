import { useState } from 'react'
import { SidebarBrand } from './sidebar-brand'
import { SidebarSearch } from './sidebar-search'
import { SidebarFooter } from './sidebar-footer'

export function Sidebar() {
  const [query, setQuery] = useState('')

  return (
    <aside className="flex h-full w-sidebar flex-col border-r border-cass-border bg-cass-sidebar">
      <SidebarBrand />
      <SidebarSearch value={query} onChange={setQuery} />
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <div className="px-3 py-8 text-center text-xs text-cass-text-muted">
          No instances yet.
          <div className="mt-1 text-cass-text-subtle">
            Click &ldquo;Add instance&rdquo; below to get started.
          </div>
        </div>
      </div>
      <SidebarFooter onAdd={() => {}} />
    </aside>
  )
}
