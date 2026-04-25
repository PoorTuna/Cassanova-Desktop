import { useEffect, useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cassanova } from '@/lib/ipc'
import type {
  CertMismatchPayload,
  CertPromptPayload,
} from '@shared/ipc-contract'

export function TrustPromptDialog() {
  const [prompt, setPrompt] = useState<CertPromptPayload | null>(null)

  useEffect(() => {
    const unsubPrompt = cassanova().certs.onPrompt(setPrompt)
    const unsubMismatch = cassanova().certs.onMismatch(notifyMismatch)
    return () => {
      unsubPrompt()
      unsubMismatch()
    }
  }, [])

  const respond = async (trust: boolean) => {
    if (!prompt) return
    await cassanova().certs.respond({ promptId: prompt.promptId, trust })
    setPrompt(null)
  }

  return (
    <AlertDialog open={prompt !== null} onOpenChange={() => respond(false)}>
      <AlertDialogContent className="border-cass-border bg-cass-surface text-cass-text-primary">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 font-display">
            <ShieldAlert className="h-5 w-5 text-cass-warning" />
            Untrusted certificate
          </AlertDialogTitle>
          <AlertDialogDescription className="text-cass-text-secondary">
            {prompt?.instanceName ? <strong>{prompt.instanceName}</strong> : null}
            {' '}presented a certificate this app has not seen before. Trust it
            only if you recognize the fingerprint below.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {prompt && (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-md border border-cass-border bg-cass-app/40 p-3 text-xs">
            <CertField label="URL" value={prompt.url} mono />
            <CertField label="Subject" value={prompt.subjectCommonName || '—'} />
            <CertField label="Issuer" value={prompt.issuerCommonName || '—'} />
            <CertField label="Fingerprint" value={prompt.fingerprint} mono breakAll />
            <CertField label="Valid until" value={formatDate(prompt.validExpiry)} />
            <CertField label="Reason" value={prompt.errorCode} mono />
          </dl>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => respond(false)}>
            Reject
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => respond(true)}>
            Trust certificate
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function CertField({
  label,
  value,
  mono = false,
  breakAll = false,
}: {
  label: string
  value: string
  mono?: boolean
  breakAll?: boolean
}) {
  return (
    <>
      <dt className="text-cass-text-muted">{label}</dt>
      <dd
        className={[
          'text-cass-text-primary',
          mono ? 'font-mono' : '',
          breakAll ? 'break-all' : 'truncate',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {value}
      </dd>
    </>
  )
}

function formatDate(seconds: number): string {
  if (!seconds) return '—'
  return new Date(seconds * 1000).toLocaleString()
}

function notifyMismatch(payload: CertMismatchPayload): void {
  toast.error(`Certificate mismatch: ${payload.instanceName}`, {
    description: `Pinned ${short(payload.pinnedFingerprint)} but server presented ${short(payload.seenFingerprint)}. Connection blocked.`,
    duration: 12000,
  })
}

function short(fp: string): string {
  if (fp.length <= 16) return fp
  return `${fp.slice(0, 10)}…${fp.slice(-6)}`
}
