'use client'

import { useTransition } from 'react'
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
import { deleteBuyer } from '@/app/actions/buyers'
import type { Buyer } from '@/lib/types'

interface DeleteBuyerDialogProps {
  buyer: Buyer | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteBuyerDialog({ buyer, open, onOpenChange }: DeleteBuyerDialogProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!buyer) return
    startTransition(async () => {
      const result = await deleteBuyer({ id: buyer.id, horse_id: buyer.horse_id })
      if (result.ok) {
        toast.success(`${buyer.first_name} removed`)
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
            Remove {buyer?.first_name} {buyer?.last_name ?? ''}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this buyer and all associated records. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Remove
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
