import { useEffect, useState, type ReactNode } from 'react'
import { ShieldCheck, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cassanova } from '@/lib/ipc'
import { useUiStore } from '@/app/ui-store'
import { useInstanceStore } from '@/features/instances/instance-store'

export function Settings() {
  const [version, setVersion] = useState<string>('—')
  const developerMode = useUiStore((s) => s.developerMode)
  const setDeveloperMode = useUiStore((s) => s.setDeveloperMode)
  const instances = useInstanceStore((s) => s.instances)
  const pinned = instances.filter((i) => i.pinnedCertFingerprint)

  useEffect(() => {
    cassanova()
      .app.version()
      .then(setVersion)
      .catch(() => setVersion('unknown'))
  }, [])

  const revoke = async (id: string, name: string) => {
    try {
      await cassanova().certs.revoke(id)
      toast.success(`Revoked trust for ${name}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to revoke')
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl px-8 py-10">
        <h1 className="mb-8 font-display text-2xl font-semibold tracking-tight">
          Settings
        </h1>

        <Section title="Appearance">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Theme</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-not-allowed rounded-md border border-cass-border bg-cass-surface px-3 py-1.5 text-xs text-cass-text-muted">
                  Dark
                </div>
              </TooltipTrigger>
              <TooltipContent>Only dark theme is available.</TooltipContent>
            </Tooltip>
          </div>
        </Section>

        <Separator className="my-6 bg-cass-border" />

        <Section title="Developer">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Developer mode</Label>
            <Switch
              checked={developerMode}
              onCheckedChange={setDeveloperMode}
              aria-label="Developer mode"
            />
          </div>
        </Section>

        <Separator className="my-6 bg-cass-border" />

        <Section title="Trusted certificates">
          {pinned.length === 0 ? (
            <p className="text-xs text-cass-text-muted">
              No certificates pinned. Self-signed instances ask for trust on
              first connect.
            </p>
          ) : (
            <ul className="grid gap-2">
              {pinned.map((instance) => (
                <li
                  key={instance.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-cass-border bg-cass-app/40 px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-cass-success" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {instance.name}
                      </div>
                      <div
                        className="truncate font-mono text-[11px] text-cass-text-muted"
                        title={instance.pinnedCertFingerprint}
                      >
                        {shortFingerprint(instance.pinnedCertFingerprint!)}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-cass-danger hover:bg-cass-danger/10 hover:text-cass-danger"
                    onClick={() => revoke(instance.id, instance.name)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Revoke
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Separator className="my-6 bg-cass-border" />

        <Section title="About">
          <Row label="Version" value={version} />
          <Row label="Repository" value="PoorTuna/Cassanova-Desktop" />
        </Section>
      </div>
    </div>
  )
}

function shortFingerprint(fp: string): string {
  if (fp.length <= 24) return fp
  return `${fp.slice(0, 14)}…${fp.slice(-8)}`
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-cass-border bg-cass-surface p-5">
      <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-cass-text-muted">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-cass-text-secondary">{label}</span>
      <span className="font-mono text-xs text-cass-text-primary">{value}</span>
    </div>
  )
}
