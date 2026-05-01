'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { ChartEmptyState } from './chart-empty-state'
import type { AnalyticsData } from '@/lib/kpis'

interface HoldingsRankedBarProps {
  data: AnalyticsData['rankedHoldings']
  height?: number
}

function trunc(s: string, n = 15) {
  return s.length > n ? s.slice(0, n) + '…' : s
}

export function HoldingsRankedBar({ data, height = 320 }: HoldingsRankedBarProps) {
  if (data.length === 0) return <ChartEmptyState height={height} />

  const chartData = data.map((row) => ({
    label: trunc(row.name),
    sharesPct: row.sharesPct,
    horseName: row.horseName,
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 4, right: 40, left: 4, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          unit="%"
        />
        <YAxis
          type="category"
          dataKey="label"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={96}
        />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any, _name: any, props: any) => [
            `${Number(value).toFixed(1)}%`,
            props?.payload?.horseName ?? '',
          ]}
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
        <Bar dataKey="sharesPct" fill="#3b82f6" radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
