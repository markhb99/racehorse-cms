import { formatCurrency } from '@/lib/format/currency'
import type { HorseStats } from '@/lib/types'

interface RevenueBreakdownProps {
  stats: HorseStats
  className?: string
}

export function RevenueBreakdown({ stats, className }: RevenueBreakdownProps) {
  return (
    <dl className={className}>
      <div className="flex justify-between text-sm">
        <dt className="text-muted-foreground">Invoiced</dt>
        <dd className="font-medium tabular-nums">{formatCurrency(stats.invoicedTotal)}</dd>
      </div>
      <div className="flex justify-between text-sm">
        <dt className="text-muted-foreground">Collected</dt>
        <dd className="font-medium tabular-nums text-green-600 dark:text-green-400">
          {formatCurrency(stats.collectedTotal)}
        </dd>
      </div>
      {stats.outstandingTotal > 0 && (
        <div className="flex justify-between text-sm">
          <dt className="text-muted-foreground">Outstanding</dt>
          <dd className="font-medium tabular-nums text-orange-600 dark:text-orange-400">
            {formatCurrency(stats.outstandingTotal)}
          </dd>
        </div>
      )}
    </dl>
  )
}
