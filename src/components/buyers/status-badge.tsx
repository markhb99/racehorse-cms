import { cn } from '@/lib/utils'
import { BUYER_STATUSES } from '@/lib/constants'
import type { BuyerStatusKey } from '@/lib/constants'

const COLOR_CLASSES: Record<string, string> = {
  green:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  yellow: 'bg-yellow-100  text-yellow-700  dark:bg-yellow-900/30  dark:text-yellow-400',
  orange: 'bg-orange-100  text-orange-700  dark:bg-orange-900/30  dark:text-orange-400',
  blue:   'bg-blue-100    text-blue-700    dark:bg-blue-900/30    dark:text-blue-400',
  purple: 'bg-purple-100  text-purple-700  dark:bg-purple-900/30  dark:text-purple-400',
  red:    'bg-red-100     text-red-700     dark:bg-red-900/30     dark:text-red-400',
}

interface StatusBadgeProps {
  status: BuyerStatusKey
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const def = BUYER_STATUSES[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        COLOR_CLASSES[def.color] ?? 'bg-muted text-muted-foreground',
        className,
      )}
    >
      <span aria-hidden>{def.emoji}</span>
      {def.label}
    </span>
  )
}
