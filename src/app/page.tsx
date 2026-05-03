import Link from 'next/link'
import { Plus, DollarSign, TrendingUp, Percent, Users } from 'lucide-react'
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server'
import { AppShell } from '@/components/shell/app-shell'
import { KpiCard } from '@/components/kpi/kpi-card'
import { HorseQuickCard } from '@/components/horses/horse-quick-card'
import { SharesByStatusBar } from '@/components/charts/shares-by-status-bar'
import { RevenuePipelineDonut } from '@/components/charts/revenue-pipeline-donut'
import { getAllActiveHorsesWithBuyers } from '@/lib/supabase/queries/horses'
import { computeGlobalKpis, computeAnalytics, computeHorseStats } from '@/lib/kpis'
import type { HorseWithStats } from '@/lib/types'
import { formatCurrency } from '@/lib/format/currency'
import { formatPercent } from '@/lib/format/percent'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default async function DashboardPage() {
  const user = await getServerUser()
  const supabase = await createServerSupabaseClient()

  const { horses, buyersByHorse } = await getAllActiveHorsesWithBuyers(supabase)

  const kpis = computeGlobalKpis(horses, buyersByHorse)
  const analytics = computeAnalytics(horses, buyersByHorse, 'all')

  const recentHorses: HorseWithStats[] = horses.slice(0, 6).map((h) => ({
    ...h,
    stats: computeHorseStats(buyersByHorse.get(h.id) ?? []),
  }))

  return (
    <AppShell email={user?.email ?? ''}>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <Link href="/horses" className={cn(buttonVariants({ size: 'sm' }), 'gap-1.5')}>
            <Plus className="h-4 w-4" /> Add Horse
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard
            label="Revenue Collected"
            value={formatCurrency(kpis.revenueCollected)}
            icon={DollarSign}
          />
          <KpiCard
            label="Revenue Invoiced"
            value={formatCurrency(kpis.revenueInvoiced)}
            icon={TrendingUp}
          />
          <KpiCard
            label="Shares Sold (avg)"
            value={formatPercent(kpis.sharesSoldWeightedPct, 1)}
            icon={Percent}
          />
          <KpiCard
            label="Active Buyers"
            value={kpis.activeBuyerCount}
            icon={Users}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold">Shares by Status</h2>
            <SharesByStatusBar data={analytics.sharesByStatusByHorse} />
          </div>
          <div className="rounded-xl border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold">Revenue Pipeline</h2>
            <RevenuePipelineDonut
              collected={analytics.revenuePipeline.collected}
              outstanding={analytics.revenuePipeline.outstanding}
            />
          </div>
        </div>

        {recentHorses.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Active Horses</h2>
              <Link
                href="/horses"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentHorses.map((horse) => (
                <HorseQuickCard key={horse.id} horse={horse} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
