'use client'

import { useEffect } from 'react'
import { ErrorState } from '@/components/feedback/error-state'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return <ErrorState retry={reset} />
}
