import Link from 'next/link'
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/buyers/status-badge'
import { formatCurrency } from '@/lib/format/currency'
import type { BuyerWithHorse } from '@/lib/types'
import type { BuyerStatusKey } from '@/lib/constants'

export function HoldingsTable({ holdings }: { holdings: BuyerWithHorse[] }) {
  if (holdings.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">No holdings yet.</p>
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/30">
          <tr>
            <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Horse</th>
            <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">%</th>
            <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Status</th>
            <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Invoice</th>
            <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Paid</th>
            <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Outstanding</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {holdings.map((h) => {
            const outstanding = Number(h.invoice_amount) - Number(h.paid_amount)
            const status = h.status as BuyerStatusKey
            const horse = h.horse as typeof h.horse | null
            return (
              <tr key={h.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-3 py-2.5 font-medium whitespace-nowrap">
                  <Link href={`/horses/${h.horse_id}`} className="hover:underline flex items-center gap-2">
                    {horse?.color && (
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ background: horse.color }}
                      />
                    )}
                    {horse?.display_name ?? 'Unknown horse'}
                  </Link>
                </td>
                <td className="px-3 py-2.5 tabular-nums">{Number(h.shares_pct).toFixed(1)}%</td>
                <td className="px-3 py-2.5"><StatusBadge status={status} /></td>
                <td className="px-3 py-2.5 tabular-nums">{formatCurrency(h.invoice_amount)}</td>
                <td className="px-3 py-2.5 tabular-nums">{formatCurrency(h.paid_amount)}</td>
                <td className={cn('px-3 py-2.5 tabular-nums', status === 'not_proceeding' && 'line-through text-muted-foreground')}>
                  {formatCurrency(outstanding)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
