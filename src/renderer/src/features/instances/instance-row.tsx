import { useMatchRoute, useNavigate } from '@tanstack/react-router'
import { Lock } from 'lucide-react'
import type { Instance } from '@shared/models'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { StatusDot } from '@/components/status-dot'
import { cn } from '@/lib/utils'
import { useInstanceActions } from './use-instance-actions'
import { useInstanceStore } from './instance-store'

interface Props {
  instance: Instance
  collapsed?: boolean
}

export function InstanceRow({ instance, collapsed = false }: Props) {
  const navigate = useNavigate()
  const matchRoute = useMatchRoute()
  const { openEdit, openDuplicate, requestDelete } = useInstanceActions()
  const hasCreds = useInstanceStore((s) => s.vaultIds.has(instance.id))

  const isActive = !!matchRoute({
    to: '/instances/$instanceId',
    params: { instanceId: instance.id },
  })

  const onActivate = () => {
    navigate({
      to: '/instances/$instanceId',
      params: { instanceId: instance.id },
    }).catch(() => {})
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          type="button"
          onClick={onActivate}
          aria-current={isActive ? 'page' : undefined}
          title={collapsed ? `${instance.name}\n${instance.url}` : undefined}
          className={cn(
            'group relative flex h-[34px] w-full items-center rounded-md text-left transition-colors duration-150',
            'hover:bg-cass-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cass-brand-primary/40',
            collapsed ? 'justify-center px-0' : 'gap-2 px-2',
            isActive && 'bg-cass-hover-active shadow-[inset_3px_0_0_var(--cass-brand-primary)]',
          )}
        >
          <StatusDot status={instance.lastStatus} />
          {!collapsed && (
            <span className="flex min-w-0 flex-1 flex-col leading-tight">
              <span
                className={cn(
                  'truncate text-[13px] font-medium',
                  isActive
                    ? 'text-cass-text-primary'
                    : 'text-cass-text-primary/90',
                )}
              >
                {instance.name}
              </span>
              <span className="truncate text-[11px] text-cass-text-muted">
                {instance.url}
              </span>
            </span>
          )}
          {hasCreds && (
            <Lock
              aria-label="Credentials saved"
              className={cn(
                'h-3 w-3 shrink-0 text-cass-text-muted',
                collapsed ? 'absolute right-1 top-1' : 'mr-1',
              )}
            />
          )}
        </button>
      </ContextMenuTrigger>

      <ContextMenuContent className="border-cass-border bg-cass-surface">
        <ContextMenuItem onSelect={() => openEdit(instance)}>Edit…</ContextMenuItem>
        <ContextMenuItem onSelect={() => openDuplicate(instance.id)}>
          Duplicate
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-cass-border" />
        <ContextMenuItem
          onSelect={() => requestDelete(instance)}
          className="text-cass-danger focus:bg-cass-danger/15 focus:text-cass-danger"
        >
          Delete…
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
