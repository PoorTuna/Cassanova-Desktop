import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Logo } from '@/components/logo'
import { useInstanceStore } from '@/features/instances/instance-store'

export function Welcome() {
  const openCreate = useInstanceStore((s) => s.openCreate)

  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-cass-surface shadow-cass-lg">
          <Logo className="h-12 w-12" />
        </div>
        <h1 className="mb-2 font-display text-2xl font-semibold tracking-tight">
          Welcome to Cassanova Desktop
        </h1>
        <p className="mb-8 text-sm text-cass-text-secondary">
          Manage multiple Cassanova instances from a single workspace. Each
          instance runs in an isolated session with its own credentials.
        </p>
        <Button size="lg" className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add your first instance
          <Badge variant="secondary" className="ml-2 font-mono text-[10px]">
            ⌘N
          </Badge>
        </Button>
      </div>
    </div>
  )
}
