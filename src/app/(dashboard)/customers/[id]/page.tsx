import { notFound } from 'next/navigation'
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server'
import { getCustomerById } from '@/lib/supabase/queries/customers'
import { computeCustomerHoldingsSummary } from '@/lib/kpis'
import { formatCurrency } from '@/lib/format/currency'
import { CustomerDetailHeader } from '@/components/customers/customer-detail-header'
import { HoldingsTable } from '@/components/customers/holdings-table'
import { CommunicationsTimeline } from '@/components/customers/communications-timeline'
import { MarketingConsentToggle } from '@/components/customers/marketing-consent-toggle'
import { KpiCard } from '@/components/kpi/kpi-card'
import { writeAuditLog } from '@/app/actions/audit'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const customer = await getCustomerById(supabase, id)
  return { title: customer?.display_name ?? 'Customer' }
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id } = await params
  const [supabase, user] = await Promise.all([
    createServerSupabaseClient(),
    getServerUser(),
  ])

  const customer = await getCustomerById(supabase, id)
  if (!customer) notFound()

  const summary = computeCustomerHoldingsSummary(customer.holdings)

  await writeAuditLog({
    action: 'view',
    entity: 'customer',
    entity_id: id,
    user_id: user?.id,
    user_email: user?.email ?? undefined,
  })

  return (
    <div className="space-y-6 max-w-4xl">
      <CustomerDetailHeader customer={customer} holdings={customer.holdings} />

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Holdings" value={`${summary.totalSharesPct.toFixed(1)}%`} />
        <KpiCard label="Horses" value={String(summary.horseCount)} />
        <KpiCard label="Lifetime Paid" value={formatCurrency(summary.lifetimePaid)} />
        <KpiCard label="Outstanding" value={formatCurrency(summary.lifetimeOutstanding)} />
      </div>

      {/* Holdings */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Holdings</h2>
        <HoldingsTable holdings={customer.holdings} />
      </section>

      {/* Marketing consent */}
      <section className="rounded-xl border bg-card p-4 space-y-2">
        <h2 className="text-sm font-semibold">Marketing Consent</h2>
        <MarketingConsentToggle customer={customer} />
      </section>

      {/* Notes */}
      {customer.notes && (
        <section className="rounded-xl border bg-card p-4 space-y-2">
          <h2 className="text-sm font-semibold">Notes</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{customer.notes}</p>
        </section>
      )}

      {/* Communications */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Communications ({customer.communications.length})
        </h2>
        <CommunicationsTimeline
          communications={customer.communications}
          onRefresh={() => {}}
        />
      </section>
    </div>
  )
}
