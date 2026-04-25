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
import { useInstanceStore } from './instance-store'
import { useInstanceActions } from './use-instance-actions'

export function DeleteConfirmDialog() {
  const pending = useInstanceStore((s) => s.pendingDelete)
  const cancelDelete = useInstanceStore((s) => s.cancelDelete)
  const instances = useInstanceStore((s) => s.instances)
  const { confirmDelete } = useInstanceActions()

  const open = pending !== null

  const onConfirm = () => {
    if (!pending) return
    const instance = instances.find((i) => i.id === pending.id)
    if (!instance) {
      cancelDelete()
      return
    }
    void confirmDelete(instance)
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && cancelDelete()}>
      <AlertDialogContent className="border-cass-border bg-cass-surface text-cass-text-primary">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display">Delete instance</AlertDialogTitle>
          <AlertDialogDescription className="text-cass-text-secondary">
            {pending
              ? `Remove "${pending.name}". Session data is preserved on disk.`
              : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-cass-border bg-cass-app">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-cass-danger text-white hover:bg-cass-danger/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
