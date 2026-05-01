'use client'

import { useState, useCallback } from 'react'

export function useConfirm() {
  const [open, setOpen] = useState(false)
  const [resolve, setResolve] = useState<((value: boolean) => void) | null>(null)

  const confirm = useCallback((): Promise<boolean> => {
    return new Promise((res) => {
      setResolve(() => res)
      setOpen(true)
    })
  }, [])

  const onConfirm = useCallback(() => {
    resolve?.(true)
    setOpen(false)
  }, [resolve])

  const onCancel = useCallback(() => {
    resolve?.(false)
    setOpen(false)
  }, [resolve])

  return { open, confirm, onConfirm, onCancel }
}
