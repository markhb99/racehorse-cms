'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ChartEmptyState } from './chart-empty-state'
import { formatCurrency } from '@/lib/format/currency'

interface RevenuePipelineDonutProps {
  collected: number
  outstanding: number
  height?: number
}

const SEGMENTS = [
  { name: 'Collected', color: '#10b981' },
  { name: 'Outstanding', color: '#eab308' },
]

export function RevenuePipelineDonut({
  collected,
  outstanding,
  height = 280,
}: RevenuePipelineDonutProps) {
  if (collected + outstanding === 0) return <ChartEmptyState height={height} />

  const data = [
    { name: 'Collected', value: collected },
    { name: 'Outstanding', value: outstanding },
  ]

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="52%"
          outerRadius="78%"
          dataKey="value"
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={SEGMENTS[i].color} />
          ))}
        </Pie>
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) => [formatCurrency(Number(value)), '']}
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
