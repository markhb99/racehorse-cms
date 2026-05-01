import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { HorseStatusBadge } from './horse-status-badge'
import { SharesProgressBar } from './shares-progress-bar'
import { formatCurrency } from '@/lib/format/currency'
import type { HorseWithStats } from '@/lib/types'

export function HorseQuickCard({ horse }: { horse: HorseWithStats }) {
  const { stats } = horse
  return (
    <Card className="relative overflow-hidden transition-shadow hover:shadow-md">
      <div
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: horse.color }}
        aria-hidden
      />
      <CardContent className="pl-5 pt-4 pb-4">
        <Link
          href={`/horses/${horse.id}`}
          className="block truncate font-semibold leading-tight hover:underline"
        >
          {horse.display_name}
        </Link>
        <HorseStatusBadge status={horse.status} className="mt-1" />

        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Shares sold</span>
            <span className="tabular-nums">{stats.sharesSoldPct.toFixed(1)}%</span>
          </div>
          <SharesProgressBar percent={stats.sharesSoldPct} color={horse.color} />
        </div>

        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Collected</p>
            <p className="text-sm font-semibold tabular-nums">
              {formatCurrency(stats.collectedTotal)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Buyers</p>
            <p className="text-sm font-semibold">
              {stats.buyerCount}
              {stats.actionRequiredCount > 0 && (
                <span className="ml-1 text-xs font-normal text-orange-500">
                  · {stats.actionRequiredCount} action
                </span>
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
