import { Plus, Settings } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

interface Props {
  onAdd: () => void
}

export function SidebarFooter({ onAdd }: Props) {
  return (
    <div className="flex items-center gap-2 border-t border-cass-border p-3">
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
