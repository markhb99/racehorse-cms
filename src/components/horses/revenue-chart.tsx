'use client'

import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts'
import { formatCurrency } from '@/lib/format/currency'

interface RevenueChartProps {
  collected: number
  outstanding: number
  unsold: number
}

export function RevenueChart({ collected, outstanding, unsold }: RevenueChartProps) {
  const total = collected + outstanding + unsold
  if (total <= 0) return null

  const data = [{ collected, outstanding, unsold }]

  return (
    <div className="rounded-xl border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Revenue Breakdown</p>
        <p className="text-sm font-semibold tabular-nums">{formatCurrency(total)} total</p>
      </div>

      <ResponsiveContainer width="100%" height={56}>
        <BarChart data={data} layout="vertical" barSize={32} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <XAxis type="number" domain={[0, total]} hide />
          <Bar dataKey="collected" name="Collected" stackId="a" fill="#22c55e" radius={[4, 0, 0, 4]}>
            <Cell fill="#22c55e" />
          </Bar>
          <Bar dataKey="outstanding" name="Outstanding" stackId="a" fill="#f59e0b">
            <Cell fill="#f59e0b" />
          </Bar>
          <Bar dataKey="unsold" name="Unsold" stackId="a" fill="#e2e8f0" radius={[0, 4, 4, 0]}>
            <Cell fill="#e2e8f0" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex flex-wrap gap-2 text-xs">
        {([
          { label: 'Collected',    value: collected,    dot: 'bg-emerald-500', pill: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
          { label: 'Outstanding',  value: outstanding,  dot: 'bg-amber-400',   pill: 'bg-amber-50 border-amber-200 text-amber-700' },
          { label: 'Unsold',       value: unsold,       dot: 'bg-slate-300',   pill: 'bg-slate-50 border-slate-200 text-slate-600' },
        ] as const).map(({ label, value, dot, pill }) => {
          const pct = total > 0 ? (value / total) * 100 : 0
          return (
            <div key={label} className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium ${pill}`}>
              <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dot}`} aria-hidden />
              <span>{label}</span>
              <span className="tabular-nums opacity-60">{pct.toFixed(0)}%</span>
              <span className="tabular-nums font-semibold">{formatCurrency(value)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
