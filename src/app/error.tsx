'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <div className="text-5xl">⚠️</div>
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-muted-foreground max-w-sm">
          An unexpected error occurred. If this keeps happening, please contact
          support.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  )
}
