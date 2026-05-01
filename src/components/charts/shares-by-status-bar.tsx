'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts'
import { ChartEmptyState } from './chart-empty-state'
import type { SharesByStatusRow } from '@/lib/kpis'

const STATUS_COLORS: Record<string, string> = {
  completed:       '#10b981',
  awaiting_payment:'#eab308',
  awaiting_docs:   '#f97316',
  awaiting_form:   '#3b82f6',
  pending:         '#a855f7',
  not_proceeding:  '#ef4444',
}

const STATUS_LABELS: Record<string, string> = {
  completed:        'Completed',
  awaiting_payment: 'Awaiting Payment',
  awaiting_docs:    'Awaiting Docs',
  awaiting_form:    'Awaiting Form',
  pending:          'Pending',
  not_proceeding:   'Not Proceeding',
}

const STATUS_KEYS = ['pending','awaiting_form','awaiting_docs','awaiting_payment','completed','not_proceeding'] as const

interface SharesByStatusBarProps {
  data: SharesByStatusRow[]
  height?: number
}

function truncate(s: string, n = 12) {
  return s.length > n ? s.slice(0, n) + '…' : s
}

export function SharesByStatusBar({ data, height = 280 }: SharesByStatusBarProps) {
  if (data.length === 0) return <ChartEmptyState height={height} />

  const chartData = data.map((row) => ({
    ...row,
    horseName: truncate(row.horseName),
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="horseName"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          unit="%"
        />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any, name: any) => [`${Number(value).toFixed(1)}%`, STATUS_LABELS[name as string] ?? name]}
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
        <Legend
          formatter={(value) => STATUS_LABELS[value] ?? value}
          wrapperStyle={{ fontSize: 11 }}
        />
        {STATUS_KEYS.map((key) => (
          <Bar key={key} dataKey={key} stackId="a" fill={STATUS_COLORS[key]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
