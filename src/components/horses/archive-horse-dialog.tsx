'use client'

import { useTransition } from 'react'
import { Loader2 } from 'lucide-react'
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
import { archiveHorse, restoreHorse } from '@/app/actions/horses'
import type { Horse } from '@/lib/types'

interface ArchiveHorseDialogProps {
  horse: Horse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ArchiveHorseDialog({ horse, open, onOpenChange }: ArchiveHorseDialogProps) {
  const [isPending, startTransition] = useTransition()
  const isArchived = horse?.status === 'archived'

  const handleConfirm = () => {
    if (!horse) return
    startTransition(async () => {
      const result = isArchived
        ? await restoreHorse({ id: horse.id })
        : await archiveHorse({ id: horse.id })

      if (result.ok) {
        toast.success(isArchived ? 'Horse restored' : 'Horse archived')
        onOpenChange(false)
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isArchived ? 'Restore' : 'Archive'} &quot;{horse?.display_name}&quot;?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isArchived
              ? 'This horse will be moved back to active status and visible in the main list.'
              : 'This horse will be hidden from the main list. You can restore it from the archived filter.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isArchived ? 'Restore' : 'Archive'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
