'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button, type ButtonProps } from '@/components/ui/button'

interface ConfirmButtonProps extends ButtonProps {
  confirmTitle?: string
  confirmDescription?: string
  confirmLabel?: string
  onConfirm: () => void | Promise<void>
}

export function ConfirmButton({
  children,
  confirmTitle = 'Are you sure?',
  confirmDescription = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  onConfirm,
  ...props
}: ConfirmButtonProps) {
  const [loading, setLoading] = useState(false)

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button {...props} />}>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>{confirmDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              setLoading(true)
              try {
                await onConfirm()
              } finally {
                setLoading(false)
              }
            }}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Please wait…' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
