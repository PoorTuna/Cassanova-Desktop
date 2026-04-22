import { useCallback } from 'react'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import type { Instance } from '@shared/models'
import { useInstanceStore } from './instance-store'

export function useInstanceActions() {
  const openEdit = useInstanceStore((s) => s.openEdit)
  const openDuplicate = useInstanceStore((s) => s.openDuplicate)
  const requestDelete = useInstanceStore((s) => s.requestDelete)
  const cancelDelete = useInstanceStore((s) => s.cancelDelete)
  const remove = useInstanceStore((s) => s.remove)
  const navigate = useNavigate()

  const confirmDelete = useCallback(
    async (instance: Instance) => {
      try {
        await remove(instance.id)
        cancelDelete()
        toast.success(`Deleted "${instance.name}"`)
        navigate({ to: '/' }).catch(() => {})
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to delete instance')
      }
    },
    [remove, cancelDelete, navigate],
  )

  return { openEdit, openDuplicate, requestDelete, confirmDelete }
}
