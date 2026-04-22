import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface Props {
  value: string
  onChange: (value: string) => void
}

export function SidebarSearch({ value, onChange }: Props) {
  return (
    <div className="relative px-3 pb-3">
      <Search className="pointer-events-none absolute left-6 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-cass-text-muted" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search instances"
        className="h-8 border-cass-border bg-cass-surface pl-8 text-sm placeholder:text-cass-text-muted"
      />
    </div>
  )
}
