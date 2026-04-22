import { Plus, Settings } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  onAdd: () => void
  collapsed?: boolean
}

export function SidebarFooter({ onAdd, collapsed = false }: Props) {
  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1 border-t border-cass-border p-2">
        <Button
          onClick={onAdd}
          size="icon"
          className="h-8 w-8"
          aria-label="Add instance"
          title="Add instance"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Link to="/settings" aria-label="Settings" title="Settings">
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    )
  }
  return (
    <div className={cn('flex items-center gap-2 border-t border-cass-border p-3')}>
      <Button onClick={onAdd} size="sm" className="flex-1">
        <Plus className="mr-1.5 h-4 w-4" />
        Add instance
      </Button>
      <Link to="/settings" aria-label="Settings">
        <Button size="icon" variant="ghost" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  )
}
