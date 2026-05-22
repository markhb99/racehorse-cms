import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../database.types'
import type { CustomerWithSummary, CustomerProfile, BuyerWithHorse } from '../../types'

type Client = SupabaseClient<Database>

export interface GetCustomersOpts {
  search?: string
  status?: string
  tags?: string[]
  stale?: boolean
  hasFollowUp?: boolean
}

export async function getCustomers(
  client: Client,
  opts: GetCustomersOpts = {},
): Promise<CustomerWithSummary[]> {
  let query = client
    .from('customers')
    .select('*')
    .is('deleted_at', null)
    .order('display_name', { ascending: true })

  if (opts.status && opts.status !== 'all') {
    query = query.eq('status', opts.status as 'prospect' | 'active' | 'lapsed' | 'archived')
  }

  if (opts.search) {
    const q = `%${opts.search}%`
    query = query.or(`display_name.ilike.${q},email.ilike.${q},phone.ilike.${q}`)
  }

  if (opts.tags && opts.tags.length > 0) {
    query = query.overlaps('tags', opts.tags)
  }

  const { data: customers, error } = await query
  if (error) throw error
  if (!customers || customers.length === 0) return []

  const customerIds = customers.map((c) => c.id)

  // Fetch buyers for summary stats
  const { data: buyers } = await client
    .from('buyers')
    .select('customer_id, shares_pct, invoice_amount, paid_amount, status, horse_id')
    .in('customer_id', customerIds)

  // Fetch latest communication per customer for lastContactedAt
  const { data: comms } = await client
    .from('customer_communications')
    .select('customer_id, occurred_at')
    .in('customer_id', customerIds)
    .order('occurred_at', { ascending: false })

  const lastContactedByCustomer = new Map<string, string>()
  for (const c of comms ?? []) {
    if (!lastContactedByCustomer.has(c.customer_id)) {
      lastContactedByCustomer.set(c.customer_id, c.occurred_at)
    }
  }

  const buyersByCustomer = new Map<string, typeof buyers>()
  for (const b of buyers ?? []) {
    const list = buyersByCustomer.get(b.customer_id) ?? []
    list.push(b)
    buyersByCustomer.set(b.customer_id, list)
  }

  const result: CustomerWithSummary[] = customers.map((c) => {
    const cBuyers = buyersByCustomer.get(c.id) ?? []
    const active = cBuyers.filter((b) => b.status !== 'not_proceeding')
    const totalSharesPct = active.reduce((s, b) => s + Number(b.shares_pct), 0)
    const lifetimeInvoiced = active.reduce((s, b) => s + Number(b.invoice_amount), 0)
    const lifetimePaid = active.reduce((s, b) => s + Number(b.paid_amount), 0)
    const horseIds = new Set(cBuyers.map((b) => b.horse_id))

    return {
      ...c,
      totalSharesPct: Math.round(totalSharesPct * 100) / 100,
      horseCount: horseIds.size,
      lifetimeInvoiced: Math.round(lifetimeInvoiced * 100) / 100,
      lifetimePaid: Math.round(lifetimePaid * 100) / 100,
      lifetimeOutstanding: Math.round((lifetimeInvoiced - lifetimePaid) * 100) / 100,
      lastContactedAt: lastContactedByCustomer.get(c.id) ?? null,
    }
  })

  // Stale filter: no contact in 90+ days
  if (opts.stale) {
    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
    return result.filter(
      (c) => c.lastContactedAt === null || c.lastContactedAt < cutoff,
    )
  }

  // Follow-up filter
  if (opts.hasFollowUp) {
    const { data: pendingFollowUps } = await client
      .from('customer_communications')
      .select('customer_id')
      .in('customer_id', customerIds)
      .not('follow_up_at', 'is', null)
      .is('follow_up_completed_at', null)

    const withFollowUp = new Set((pendingFollowUps ?? []).map((r) => r.customer_id))
    return result.filter((c) => withFollowUp.has(c.id))
  }

  return result
}

export async function getCustomerById(
  client: Client,
  id: string,
): Promise<CustomerProfile | null> {
  const { data: customer, error } = await client
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  if (!customer || customer.deleted_at) return null

  const [{ data: buyerRows }, { data: comms }] = await Promise.all([
    client
      .from('buyers')
      .select('*, horse:horses(id,display_name,color,status)')
      .eq('customer_id', id)
      .order('created_at', { ascending: false }),
    client
      .from('customer_communications')
      .select('*')
      .eq('customer_id', id)
      .order('occurred_at', { ascending: false }),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const holdings: BuyerWithHorse[] = ((buyerRows ?? []) as any[]).map((b) => {
    const horse = Array.isArray(b.horse) ? b.horse[0] : b.horse
    return {
      ...b,
      horse: horse ?? { id: b.horse_id, display_name: 'Unknown', color: '#888888', status: 'unknown' },
    }
  })

  return {
    ...customer,
    holdings,
    communications: comms ?? [],
  }
}

export async function findOrCreateCustomer(
  client: Client,
  input: { email?: string; firstName: string; lastName?: string; phone?: string },
): Promise<{ id: string; created: boolean }> {
  const normEmail = input.email ? input.email.toLowerCase().trim() : ''
  const normName = `${input.firstName} ${input.lastName ?? ''}`.trim().toLowerCase()

  if (normEmail) {
    const { data } = await client
      .from('customers')
      .select('id')
      .eq('email', normEmail)
      .is('deleted_at', null)
      .limit(1)
      .single()
    if (data) return { id: data.id, created: false }
  }

  const { data: byName } = await client
    .from('customers')
    .select('id')
    .ilike('display_name', normName)
    .is('deleted_at', null)
    .limit(1)
    .single()
  if (byName) return { id: byName.id, created: false }

  const displayName = `${input.firstName} ${input.lastName ?? ''}`.trim()
  const { data: created, error } = await client
    .from('customers')
    .insert({
      legal_first_name: input.firstName,
      legal_last_name: input.lastName ?? null,
      display_name: displayName,
      email: normEmail || null,
      phone: input.phone ?? null,
      marketing_consent: false,
    })
    .select('id')
    .single()

  if (error) throw error
  return { id: created.id, created: true }
}

export async function getSimilarCustomers(
  client: Client,
  displayName: string,
): Promise<Array<{ id: string; display_name: string }>> {
  const { data } = await client
    .from('customers')
    .select('id, display_name')
    .ilike('display_name', `%${displayName.slice(0, 6)}%`)
    .is('deleted_at', null)
    .limit(5)

  return data ?? []
}
