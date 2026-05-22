import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server'
import { getCustomers } from '@/lib/supabase/queries/customers'
import { writeAuditLog } from '@/app/actions/audit'

export async function GET(req: Request) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const url = new URL(req.url)
  const marketingConsentOnly = url.searchParams.get('marketingConsentOnly') === 'true'
  const status = url.searchParams.get('status') ?? undefined

  const supabase = await createServerSupabaseClient()
  let customers = await getCustomers(supabase, { status })

  // SPAM ACT 2003: filter to marketing_consent = true when requested
  if (marketingConsentOnly) {
    customers = customers.filter((c) => c.marketing_consent)
  }

  const rows = customers.map((c) => ({
    'Display Name': c.display_name,
    'Email': c.email ?? '',
    'Phone': c.phone ?? '',
    'Entity Type': c.entity_type,
    'Status': c.status,
    'Marketing Consent': c.marketing_consent ? 'Yes' : 'No',
    'Tags': (c.tags ?? []).join(', '),
    'Total %': c.totalSharesPct,
    'Horses': c.horseCount,
    'Lifetime Paid': c.lifetimePaid,
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Customers')
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'csv' })

  await writeAuditLog({
    action: 'export',
    entity: 'export',
    user_id: user.id,
    user_email: user.email ?? undefined,
    payload: { format: 'csv', rowCount: rows.length, marketingConsentOnly, status },
  })

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="customers-${new Date().toISOString().slice(0,10)}.csv"`,
    },
  })
}
