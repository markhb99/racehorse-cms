import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server'
import { getCustomers } from '@/lib/supabase/queries/customers'
import { dueFollowUps } from '@/lib/kpis'
import { CustomerListClient } from '@/components/customers/customer-list-client'
import { FollowUpsDueCard } from '@/components/customers/follow-ups-due-card'
import { writeAuditLog } from '@/app/actions/audit'

export const metadata = { title: 'Customers' }

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string }>
}

export default async function CustomersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const q = params.q ?? ''
  const status = params.status ?? ''

  const [supabase, user] = await Promise.all([
    createServerSupabaseClient(),
    getServerUser(),
  ])

  const customers = await getCustomers(supabase, {
    search: q || undefined,
    status: status || undefined,
  })

  // Follow-ups due
  const { data: pendingComms } = await supabase
    .from('customer_communications')
    .select('*')
    .not('follow_up_at', 'is', null)
    .is('follow_up_completed_at', null)
    .order('follow_up_at', { ascending: true })

  const { overdue, dueThisWeek } = dueFollowUps(pendingComms ?? [], new Date())

  const customerNames = new Map(customers.map((c) => [c.id, c.display_name]))

  await writeAuditLog({
    action: 'view',
    entity: 'customer',
    user_id: user?.id,
    user_email: user?.email ?? undefined,
  })

  return (
    <div className="space-y-4">
      {(overdue.length > 0 || dueThisWeek.length > 0) && (
        <FollowUpsDueCard
          overdue={overdue}
          dueThisWeek={dueThisWeek}
          customerNames={customerNames}
        />
      )}
      <CustomerListClient
        customers={customers}
        initialSearch={q}
        initialStatus={status}
      />
    </div>
  )
}
