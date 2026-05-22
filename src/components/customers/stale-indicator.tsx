import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

const STALE_DAYS = 90

export function StaleIndicator({ lastContactedAt, className }: { lastContactedAt: string | null; className?: string }) {
  if (!lastContactedAt) {
    return (
      <span className={cn('inline-flex items-center gap-1 text-xs text-muted-foreground', className)}>
        <Clock className="h-3 w-3" />Never contacted
      </span>
    )
  }

  const daysSince = Math.floor((Date.now() - new Date(lastContactedAt).getTime()) / (1000 * 60 * 60 * 24))
  if (daysSince < STALE_DAYS) return null

  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-medium text-amber-700', className)}>
      <Clock className="h-3 w-3" />
      {daysSince}d ago
    </span>
  )
}
