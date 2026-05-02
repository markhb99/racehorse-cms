import { cn } from '@/lib/utils'
import { BUYER_STATUSES } from '@/lib/constants'
import type { BuyerStatusKey } from '@/lib/constants'

const PIPELINE_ORDER: BuyerStatusKey[] = [
  'pending',
  'awaiting_form',
  'awaiting_docs',
  'awaiting_payment',
  'completed',
  'not_proceeding',
]

const COLOR_CLASSES: Record<string, { pill: string; dot: string; badge: string }> = {
  green:  { pill: 'bg-emerald-50 border-emerald-200 text-emerald-700', dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
  yellow: { pill: 'bg-amber-50 border-amber-200 text-amber-700',       dot: 'bg-amber-500',   badge: 'bg-amber-100 text-amber-700' },
  orange: { pill: 'bg-orange-50 border-orange-200 text-orange-700',    dot: 'bg-orange-500',  badge: 'bg-orange-100 text-orange-700' },
  blue:   { pill: 'bg-blue-50 border-blue-200 text-blue-700',          dot: 'bg-blue-500',    badge: 'bg-blue-100 text-blue-700' },
  purple: { pill: 'bg-purple-50 border-purple-200 text-purple-700',    dot: 'bg-purple-500',  badge: 'bg-purple-100 text-purple-700' },
  red:    { pill: 'bg-red-50 border-red-200 text-red-700',             dot: 'bg-red-500',     badge: 'bg-red-100 text-red-700' },
}

interface StatusPipelineProps {
  counts: Record<BuyerStatusKey, number>
  className?: string
}

export function StatusPipeline({ counts, className }: StatusPipelineProps) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {PIPELINE_ORDER.map((key) => {
        const def = BUYER_STATUSES[key]
        const count = counts[key] ?? 0
        const colors = COLOR_CLASSES[def.color] ?? COLOR_CLASSES.blue

        return (
          <div
            key={key}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-opacity',
              colors.pill,
              count === 0 && 'opacity-40',
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', colors.dot)} aria-hidden />
            <span>{def.label}</span>
            <span
              className={cn(
                'ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums',
                colors.badge,
              )}
            >
              {count}
            </span>
          </div>
        )
      })}
      {total === 0 && (
        <p className="text-xs text-muted-foreground italic">No buyers yet</p>
      )}
    </div>
  )
}
