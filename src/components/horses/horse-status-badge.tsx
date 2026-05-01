import { cn } from '@/lib/utils'
import type { HorseStatus } from '@/lib/types'

const STATUS_CONFIG: Record<HorseStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  sold:   { label: 'Sold',   className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  archived: { label: 'Archived', className: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400' },
}

interface HorseStatusBadgeProps {
  status: HorseStatus
  className?: string
}

export function HorseStatusBadge({ status, className }: HorseStatusBadgeProps) {
  const { label, className: colorClass } = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        colorClass,
        className,
      )}
    >
      {label}
    </span>
  )
}
