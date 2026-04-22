import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { validateUrl } from '@/lib/url'
import {
  applyDraft,
  buildInstance,
  useInstanceStore,
  type InstanceDraft,
} from './instance-store'

const EMPTY_DRAFT: InstanceDraft = { name: '', url: '', authType: 'local' }

export function InstanceDialog() {
  const dialog = useInstanceStore((s) => s.dialog)
  const closeDialog = useInstanceStore((s) => s.closeDialog)
  const upsert = useInstanceStore((s) => s.upsert)

  const [draft, setDraft] = useState<InstanceDraft>(EMPTY_DRAFT)
  const [urlError, setUrlError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const open = dialog.mode !== 'closed'
  const isEdit = dialog.mode === 'edit'

  useEffect(() => {
    if (dialog.mode === 'create') {
      setDraft(dialog.preset ?? EMPTY_DRAFT)
    } else if (dialog.mode === 'edit') {
      setDraft({
        name: dialog.instance.name,
        url: dialog.instance.url,
        authType: dialog.instance.authType,
      })
    }
    setUrlError(null)
    setSubmitting(false)
  }, [dialog])

  const onOpenChange = (next: boolean) => {
    if (!next) closeDialog()
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    const trimmedName = draft.name.trim()
    if (!trimmedName) {
      toast.error('Name is required')
      return
    }

    const url = validateUrl(draft.url)
    if (!url.ok) {
      setUrlError(url.reason)
      return
    }

    const normalized: InstanceDraft = { ...draft, name: trimmedName, url: url.url }
    const instance =
      dialog.mode === 'edit'
        ? applyDraft(dialog.instance, normalized)
        : buildInstance(normalized)

    setSubmitting(true)
    try {
      await upsert(instance)
      toast.success(isEdit ? 'Instance updated' : 'Instance added')
      closeDialog()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save instance')
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border-cass-border bg-cass-surface text-cass-text-primary sm:max-w-[420px]"
      >
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEdit ? 'Edit instance' : 'Add instance'}
          </DialogTitle>
          <DialogDescription className="text-cass-text-secondary">
            Each instance keeps its own session and credentials.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="instance-name">Name</Label>
            <Input
              id="instance-name"
              autoFocus
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="Local dev"
              className="h-9 border-cass-border bg-cass-app"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="instance-url">URL</Label>
            <Input
              id="instance-url"
              type="url"
              value={draft.url}
              onChange={(e) => {
                setDraft((d) => ({ ...d, url: e.target.value }))
                if (urlError) setUrlError(null)
              }}
              placeholder="https://cassanova.example.com"
              className="h-9 border-cass-border bg-cass-app font-mono text-xs"
              required
            />
            {urlError && (
              <p className="text-xs text-cass-danger">{urlError}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="instance-auth">Authentication</Label>
            <Select
              value={draft.authType}
              onValueChange={(value) =>
                setDraft((d) => ({ ...d, authType: value as InstanceDraft['authType'] }))
              }
            >
              <SelectTrigger
                id="instance-auth"
                className="h-9 border-cass-border bg-cass-app"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-cass-border bg-cass-surface">
                <SelectItem value="local">Local</SelectItem>
                <SelectItem value="ldap">LDAP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-2 gap-2 sm:gap-2">
            <Button type="button" variant="ghost" onClick={closeDialog}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {isEdit ? 'Save changes' : 'Add instance'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
