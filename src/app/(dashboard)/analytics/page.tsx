import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getAllActiveHorsesWithBuyers } from '@/lib/supabase/queries/horses'
import { computeAnalytics, type AnalyticsRange } from '@/lib/kpis'
import { SharesByStatusBar } from '@/components/charts/shares-by-status-bar'
import { RevenuePipelineDonut } from '@/components/charts/revenue-pipeline-donut'
import { HoldingsRankedBar } from '@/components/charts/holdings-ranked-bar'
import { formatCurrency } from '@/lib/format/currency'
import { formatPercent } from '@/lib/format/percent'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Analytics' }

const RANGES: { value: AnalyticsRange; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
]

const VALID_RANGES = new Set<string>(['all', '30d', '90d'])

interface AnalyticsPageProps {
  searchParams: Promise<{ range?: string }>
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const { range: rawRange } = await searchParams
  const range: AnalyticsRange = VALID_RANGES.has(rawRange ?? '') ? (rawRange as AnalyticsRange) : 'all'

  const supabase = await createServerSupabaseClient()
  const { horses, buyersByHorse } = await getAllActiveHorsesWithBuyers(supabase)
  const analytics = computeAnalytics(horses, buyersByHorse, range)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <div className="flex gap-1 rounded-lg border bg-muted p-1">
          {RANGES.map((r) => (
            <Link
              key={r.value}
              href={`/analytics?range=${r.value}`}
              className={cn(
                'rounded-md px-3 py-1 text-sm font-medium transition-colors',
                range === r.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {r.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      {analytics.summary && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Largest Holder
            </p>
            <p className="mt-1 truncate text-sm font-semibold">{analytics.summary.largestHolder}</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Avg Share Size
            </p>
            <p className="mt-1 text-sm font-semibold">
              {formatPercent(analytics.summary.avgShareSize, 1)}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Most Common Status
            </p>
            <p className="mt-1 text-sm font-semibold capitalize">
              {analytics.summary.mostCommonStatus.replace(/_/g, ' ')}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Newest Buyer
            </p>
            <p className="mt-1 truncate text-sm font-semibold">{analytics.summary.newestBuyer}</p>
          </div>
        </div>
      )}

      {/* Revenue */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold">Shares Allocation by Horse</h2>
          <SharesByStatusBar data={analytics.sharesByStatusByHorse} height={300} />
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="mb-4 flex items-start justify-between gap-2">
            <h2 className="text-sm font-semibold">Revenue Pipeline</h2>
            <div className="text-right text-xs text-muted-foreground">
              <p>Collected: {formatCurrency(analytics.revenuePipeline.collected)}</p>
              <p>Outstanding: {formatCurrency(analytics.revenuePipeline.outstanding)}</p>
            </div>
          </div>
          <RevenuePipelineDonut
            collected={analytics.revenuePipeline.collected}
            outstanding={analytics.revenuePipeline.outstanding}
            height={300}
          />
        </div>
      </div>

      {/* Ranked holdings */}
      <div className="rounded-xl border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold">Top 20 Holdings by Share %</h2>
        <HoldingsRankedBar data={analytics.rankedHoldings} height={Math.max(280, analytics.rankedHoldings.length * 28)} />
      </div>
    </div>
  )
}
