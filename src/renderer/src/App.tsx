import { Database, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function App() {
  return (
    <div className="dark flex h-screen bg-background text-foreground">
      <aside className="flex w-64 flex-col border-r border-border bg-card">
        <div className="drag-region h-9" />
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <Database className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <div className="text-sm font-semibold leading-none">Cassanova</div>
              <div className="mt-0.5 text-xs text-muted-foreground">Desktop</div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-3">
          <div className="mb-2 px-2 text-xs uppercase tracking-wider text-muted-foreground">
            Instances
          </div>
          <div className="px-2 py-4 text-sm text-muted-foreground">No instances yet.</div>
        </div>

        <div className="border-t border-border p-3">
          <Button className="w-full" size="sm">
            <Plus className="mr-1 h-4 w-4" />
            Add instance
          </Button>
        </div>
      </aside>

      <main className="flex flex-1 flex-col">
        <div className="drag-region h-9 border-b border-border" />
        <div className="flex flex-1 items-center justify-center">
          <div className="max-w-sm text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Database className="h-6 w-6 text-muted-foreground" />
            </div>
            <h2 className="mb-1 text-lg font-semibold">Welcome to Cassanova Desktop</h2>
            <p className="text-sm text-muted-foreground">
              Add a Cassanova instance to get started. Your credentials stay in the OS keychain.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
