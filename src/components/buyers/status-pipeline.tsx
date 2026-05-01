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

interface StatusPipelineProps {
  counts: Record<BuyerStatusKey, number>
  className?: string
}

export function StatusPipeline({ counts, className }: StatusPipelineProps) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div className={cn('flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-1', className)}>
      {PIPELINE_ORDER.map((key, idx) => {
        const def = BUYER_STATUSES[key]
        const count = counts[key] ?? 0
        const isTerminal = def.terminal
        const isLast = key === 'not_proceeding'

        return (
          <div key={key} className="flex items-center gap-1">
            {idx > 0 && !isLast && (
              <span className="hidden text-muted-foreground sm:block" aria-hidden>
                →
              </span>
            )}
            {isLast && (
              <span className="hidden text-muted-foreground sm:block" aria-hidden>
                ·
              </span>
            )}
            <div
              className={cn(
                'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-opacity',
                count === 0 && 'opacity-40',
                isTerminal ? 'border-dashed' : 'border-solid',
              )}
            >
              <span aria-hidden>{def.emoji}</span>
              <span className="hidden font-medium sm:block">{def.label}</span>
              <span className="sm:hidden font-medium">{def.label.split(' ')[0]}</span>
              <span
                className={cn(
                  'inline-flex h-4.5 min-w-[1.125rem] items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums',
                  count > 0 ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground',
                )}
              >
                {count}
              </span>
            </div>
          </div>
        )
      })}
      {total === 0 && (
        <p className="text-xs text-muted-foreground italic">No buyers yet</p>
      )}
    </div>
  )
}
