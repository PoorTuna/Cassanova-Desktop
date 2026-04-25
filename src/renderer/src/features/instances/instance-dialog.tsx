import { useEffect, useState, type FormEvent } from 'react'
import { Eye, EyeOff } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cassanova } from '@/lib/ipc'
import { validateUrl } from '@/lib/url'
import {
  applyDraft,
  buildInstance,
  useInstanceStore,
  type InstanceDraft,
} from './instance-store'

const EMPTY_DRAFT: InstanceDraft = { name: '', url: '', authType: 'local' }
const PASSWORD_MASK = '••••••••'

interface CredsState {
  saveToVault: boolean
  username: string
  password: string
  /** When editing and creds already exist, password input starts as the masked
   * placeholder. Treated as "unchanged" unless the user types something else. */
  passwordIsPlaceholder: boolean
}

const EMPTY_CREDS: CredsState = {
  saveToVault: false,
  username: '',
  password: '',
  passwordIsPlaceholder: false,
}

export function InstanceDialog() {
  const dialog = useInstanceStore((s) => s.dialog)
  const closeDialog = useInstanceStore((s) => s.closeDialog)
  const upsert = useInstanceStore((s) => s.upsert)
  const refreshVault = useInstanceStore((s) => s.refreshVault)

  const [draft, setDraft] = useState<InstanceDraft>(EMPTY_DRAFT)
  const [creds, setCreds] = useState<CredsState>(EMPTY_CREDS)
  const [showPassword, setShowPassword] = useState(false)
  const [urlError, setUrlError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const open = dialog.mode !== 'closed'
  const isEdit = dialog.mode === 'edit'

  useEffect(() => {
    let cancelled = false
    async function init() {
      if (dialog.mode === 'create') {
        setDraft(dialog.preset ?? EMPTY_DRAFT)
        setCreds(EMPTY_CREDS)
      } else if (dialog.mode === 'edit') {
        setDraft({
          name: dialog.instance.name,
          url: dialog.instance.url,
          authType: dialog.instance.authType,
        })
        const hasStored = await cassanova().vault.has(dialog.instance.id)
        if (cancelled) return
        setCreds({
          saveToVault: hasStored,
          username: '',
          password: hasStored ? PASSWORD_MASK : '',
          passwordIsPlaceholder: hasStored,
        })
      }
      setUrlError(null)
      setShowPassword(false)
      setSubmitting(false)
    }
    init().catch(() => {})
    return () => {
      cancelled = true
    }
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

    if (creds.saveToVault) {
      if (!creds.username.trim()) {
        toast.error('Username is required when saving credentials')
        return
      }
      if (!creds.passwordIsPlaceholder && !creds.password) {
        toast.error('Password is required when saving credentials')
        return
      }
    }

    const normalized: InstanceDraft = { ...draft, name: trimmedName, url: url.url }
    const instance =
      dialog.mode === 'edit'
        ? applyDraft(dialog.instance, normalized)
        : buildInstance(normalized)

    setSubmitting(true)
    try {
      await upsert(instance)
      await syncVault(instance.id, creds, isEdit)
      await refreshVault()
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
            Isolated session per instance.
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

          <div className="flex items-center justify-between rounded-md border border-cass-border bg-cass-app/40 px-3 py-2">
            <div className="grid gap-0.5">
              <Label htmlFor="instance-save-creds" className="cursor-pointer">
                Save credentials
              </Label>
              <p className="text-[11px] text-cass-text-muted">
                Stored in the OS keychain. Auto-signs you in.
              </p>
            </div>
            <Switch
              id="instance-save-creds"
              checked={creds.saveToVault}
              onCheckedChange={(checked) =>
                setCreds((c) => ({ ...c, saveToVault: checked }))
              }
            />
          </div>

          {creds.saveToVault && (
            <div className="grid gap-3 rounded-md border border-cass-border bg-cass-app/40 px-3 py-3">
              <div className="grid gap-2">
                <Label htmlFor="instance-username">Username</Label>
                <Input
                  id="instance-username"
                  autoComplete="off"
                  value={creds.username}
                  onChange={(e) =>
                    setCreds((c) => ({ ...c, username: e.target.value }))
                  }
                  placeholder="cassanova-user"
                  className="h-9 border-cass-border bg-cass-app"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="instance-password">Password</Label>
                <div className="relative">
                  <Input
                    id="instance-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={creds.password}
                    onFocus={() => {
                      if (creds.passwordIsPlaceholder) {
                        setCreds((c) => ({
                          ...c,
                          password: '',
                          passwordIsPlaceholder: false,
                        }))
                      }
                    }}
                    onChange={(e) =>
                      setCreds((c) => ({
                        ...c,
                        password: e.target.value,
                        passwordIsPlaceholder: false,
                      }))
                    }
                    className="h-9 border-cass-border bg-cass-app pr-9"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-cass-text-muted hover:text-cass-text-primary"
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                {creds.passwordIsPlaceholder && (
                  <p className="text-[11px] text-cass-text-muted">
                    Leave unchanged to keep the existing password.
                  </p>
                )}
              </div>
            </div>
          )}

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

async function syncVault(
  instanceId: string,
  creds: CredsState,
  isEdit: boolean,
): Promise<void> {
  const api = cassanova().vault
  if (!creds.saveToVault) {
    if (isEdit) await api.delete(instanceId)
    return
  }
  if (creds.passwordIsPlaceholder && !creds.username.trim()) {
    // Edit dialog opened, toggle stayed on, nothing changed — no-op.
    return
  }
  const username = creds.username.trim()
  if (creds.passwordIsPlaceholder) {
    // User updated the username but not the password; only meaningful when an
    // existing record is present, but we have no plaintext to re-encode. Skip
    // — the rare case can be handled by re-entering both fields.
    return
  }
  await api.set(instanceId, { username, password: creds.password })
}
