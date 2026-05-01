'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { deleteHorse } from '@/app/actions/horses'
import type { Horse } from '@/lib/types'

interface DeleteHorseDialogProps {
  horse: Horse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteHorseDialog({ horse, open, onOpenChange }: DeleteHorseDialogProps) {
  const [confirmName, setConfirmName] = useState('')
  const [isPending, startTransition] = useTransition()

  const nameMatches =
    confirmName.trim().toLowerCase() === (horse?.display_name ?? '').trim().toLowerCase()

  const handleDelete = () => {
    if (!horse || !nameMatches) return
    startTransition(async () => {
      const result = await deleteHorse({ id: horse.id, confirmName })
      if (result.ok) {
        toast.success(`"${horse.display_name}" deleted`)
        setConfirmName('')
        onOpenChange(false)
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleOpenChange = (v: boolean) => {
    if (!v) setConfirmName('')
    onOpenChange(v)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &quot;{horse?.display_name}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the horse and all its buyer records. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Type <span className="font-medium text-foreground">{horse?.display_name}</span> to
            confirm:
          </p>
          <Input
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={horse?.display_name ?? ''}
            disabled={isPending}
            autoComplete="off"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!nameMatches || isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
