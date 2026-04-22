import type { InstanceStatus } from '@shared/models'
import { cn } from '@/lib/utils'

const STATUS_COLORS: Record<InstanceStatus, string> = {
  unknown: 'bg-cass-text-subtle',
  reachable: 'bg-cass-info',
  healthy: 'bg-cass-success',
  'auth-expired': 'bg-cass-warning',
  unreachable: 'bg-cass-danger',
}

export function StatusDot({
  status = 'unknown',
  className,
}: {
  status?: InstanceStatus
  className?: string
}) {
  return (
    <span
      aria-label={status}
      className={cn('h-2 w-2 shrink-0 rounded-full', STATUS_COLORS[status], className)}
    />
  )
}
