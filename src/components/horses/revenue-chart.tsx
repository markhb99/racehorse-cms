'use client'

import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatCurrency } from '@/lib/format/currency'

interface RevenueChartProps {
  collected: number
  outstanding: number
  unsold: number
}

interface TooltipPayload {
  name: string
  value: number
  fill: string
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md space-y-1">
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: p.fill }} />
          <span className="text-muted-foreground">{p.name}</span>
          <span className="font-semibold tabular-nums ml-auto pl-4">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
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

      <ResponsiveContainer width="100%" height={48}>
        <BarChart data={data} layout="vertical" barSize={28} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <XAxis type="number" domain={[0, total]} hide />
          <Tooltip content={<CustomTooltip />} cursor={false} />
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

      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500 shrink-0" />
          <span className="text-muted-foreground">Collected</span>
          <span className="font-semibold tabular-nums">{formatCurrency(collected)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shrink-0" />
          <span className="text-muted-foreground">Outstanding</span>
          <span className="font-semibold tabular-nums">{formatCurrency(outstanding)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-200 shrink-0" />
          <span className="text-muted-foreground">Unsold</span>
          <span className="font-semibold tabular-nums">{formatCurrency(unsold)}</span>
        </div>
      </div>
    </div>
  )
}
