import { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cassanova } from '@/lib/ipc'

export function Settings() {
  const [version, setVersion] = useState<string>('—')

  useEffect(() => {
    cassanova()
      .app.version()
      .then(setVersion)
      .catch(() => setVersion('unknown'))
  }, [])

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl px-8 py-10">
        <h1 className="mb-1 font-display text-2xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="mb-8 text-sm text-cass-text-secondary">
          Configure how Cassanova Desktop looks and behaves.
        </p>

        <Section title="Appearance">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Theme</Label>
              <p className="mt-1 text-xs text-cass-text-muted">
                Light theme coming in a later release.
              </p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-not-allowed rounded-md border border-cass-border bg-cass-surface px-3 py-1.5 text-xs text-cass-text-muted">
                  Dark (locked)
                </div>
              </TooltipTrigger>
              <TooltipContent>Light theme coming in a later release.</TooltipContent>
            </Tooltip>
          </div>
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
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
