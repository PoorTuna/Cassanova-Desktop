import { useEffect, useState } from 'react'
import { Download, RotateCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cassanova } from '@/lib/ipc'
import type { UpdaterStatus } from '@shared/ipc-contract'

export function UpdatesSection() {
  const [status, setStatus] = useState<UpdaterStatus>({ phase: 'idle' })
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    cassanova()
      .updater.getStatus()
      .then(setStatus)
      .catch(() => {})
    return cassanova().updater.onStatus(setStatus)
  }, [])

  const onDownload = async () => {
    setBusy(true)
    try {
      await cassanova().updater.download()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Download failed')
    } finally {
      setBusy(false)
    }
  }

  const onInstall = async () => {
    try {
      await cassanova().updater.install()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Install failed')
    }
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <StatusLine status={status} />
        <PrimaryAction
          status={status}
          busy={busy}
          onDownload={onDownload}
          onInstall={onInstall}
        />
      </div>
      {status.phase === 'downloading' && <ProgressBar percent={status.percent} />}
    </div>
  )
}

function StatusLine({ status }: { status: UpdaterStatus }) {
  switch (status.phase) {
    case 'idle':
      return <Text muted>Up to date as of last check.</Text>
    case 'checking':
      return <Text muted>Checking for updates…</Text>
    case 'available':
      return <Text>Update available — version {status.version}.</Text>
    case 'not-available':
      return <Text muted>You are on the latest version ({status.version}).</Text>
    case 'downloading':
      return <Text>Downloading {status.percent.toFixed(0)}%…</Text>
    case 'downloaded':
      return <Text>Update {status.version} ready to install.</Text>
    case 'error':
      return <Text danger>{status.message}</Text>
  }
}

function PrimaryAction({
  status,
  busy,
  onDownload,
  onInstall,
}: {
  status: UpdaterStatus
  busy: boolean
  onDownload: () => void
  onInstall: () => void
}) {
  if (status.phase === 'downloaded') {
    return (
      <Button size="sm" onClick={onInstall} className="gap-1.5">
        <RotateCw className="h-3.5 w-3.5" />
        Restart and install
      </Button>
    )
  }
  if (status.phase === 'available') {
    return (
      <Button size="sm" onClick={onDownload} disabled={busy} className="gap-1.5">
        <Download className="h-3.5 w-3.5" />
        Download
      </Button>
    )
  }
  return null
}

function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent))
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-cass-app">
      <div
        className="h-full bg-cass-brand-primary transition-[width] duration-200"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}

function Text({
  children,
  muted = false,
  danger = false,
}: {
  children: React.ReactNode
  muted?: boolean
  danger?: boolean
}) {
  const cls = danger
    ? 'text-cass-danger'
    : muted
      ? 'text-cass-text-muted'
      : 'text-cass-text-primary'
  return <span className={`text-xs ${cls}`}>{children}</span>
}
