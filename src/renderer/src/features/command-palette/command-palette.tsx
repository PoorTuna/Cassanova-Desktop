import { useNavigate, useRouterState } from '@tanstack/react-router'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import {
  Globe,
  Home,
  PanelLeft,
  Plus,
  RefreshCw,
  Settings as SettingsIcon,
} from 'lucide-react'
import { useInstanceStore } from '@/features/instances/instance-store'
import { webviewRegistry } from '@/features/instances/webview-registry'
import { useUiStore } from '@/app/ui-store'
import { usePlatform } from '@/hooks/use-platform'

const INSTANCE_ROUTE_PREFIX = '/instances/'

function currentInstanceIdFromPath(pathname: string): string | null {
  if (!pathname.startsWith(INSTANCE_ROUTE_PREFIX)) return null
  const rest = pathname.slice(INSTANCE_ROUTE_PREFIX.length)
  const id = rest.split('/')[0]
  return id || null
}

export function CommandPalette() {
  const open = useUiStore((s) => s.paletteOpen)
  const setPaletteOpen = useUiStore((s) => s.setPaletteOpen)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const openCreate = useInstanceStore((s) => s.openCreate)
  const instances = useInstanceStore((s) => s.instances)
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const platform = usePlatform()
  const mod = platform === 'darwin' ? '⌘' : 'Ctrl+'

  const run = (fn: () => void) => {
    setPaletteOpen(false)
    fn()
  }

  const goto = (to: string) => {
    run(() => {
      navigate({ to }).catch(() => {})
    })
  }

  const reloadCurrent = () => {
    const id = currentInstanceIdFromPath(pathname)
    if (!id) return
    webviewRegistry.get(id)?.reload()
  }

  return (
    <CommandDialog open={open} onOpenChange={setPaletteOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        {instances.length > 0 && (
          <>
            <CommandGroup heading="Instances">
              {instances.map((instance) => (
                <CommandItem
                  key={instance.id}
                  value={`instance ${instance.name} ${instance.url}`}
                  onSelect={() => goto(`/instances/${instance.id}`)}
                >
                  <Globe />
                  <span className="flex-1 truncate">{instance.name}</span>
                  <span className="truncate font-mono text-[11px] text-muted-foreground">
                    {instance.url}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}
        <CommandGroup heading="Actions">
          <CommandItem
            value="add instance new"
            onSelect={() => run(openCreate)}
          >
            <Plus />
            <span>Add instance</span>
            <CommandShortcut>{`${mod}N`}</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="open settings preferences"
            onSelect={() => goto('/settings')}
          >
            <SettingsIcon />
            <span>Settings</span>
            <CommandShortcut>{`${mod},`}</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="toggle sidebar collapse"
            onSelect={() => run(toggleSidebar)}
          >
            <PanelLeft />
            <span>Toggle sidebar</span>
            <CommandShortcut>{`${mod}B`}</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="reload current instance refresh"
            onSelect={() => run(reloadCurrent)}
            disabled={!currentInstanceIdFromPath(pathname)}
          >
            <RefreshCw />
            <span>Reload instance</span>
            <CommandShortcut>{`${mod}R`}</CommandShortcut>
          </CommandItem>
          <CommandItem value="go home welcome" onSelect={() => goto('/')}>
            <Home />
            <span>Home</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
