import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function HorseNotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="text-5xl">🐎</div>
      <h1 className="text-2xl font-semibold">Horse not found</h1>
      <p className="text-muted-foreground">
        This horse doesn&apos;t exist or has been deleted.
      </p>
      <Link href="/horses" className={buttonVariants()}>Back to Horses</Link>
    </div>
  )
}
