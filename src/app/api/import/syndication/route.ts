import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server'
import { findOrCreateCustomer } from '@/lib/supabase/queries/customers'
import { writeAuditLog } from '@/app/actions/audit'

const horseSchema = z.object({
  display_name:        z.string().min(1).max(120),
  total_shares:        z.number().int().min(1).max(100).default(100),
  share_price_per_pct: z.number().min(0).default(0),
  color:               z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#2563EB'),
  notes:               z.string().optional(),
})

const rowSchema = z.object({
  first_name:     z.string().min(1),
  last_name:      z.string().nullable().optional(),
  email:          z.string().nullable().optional(),
  phone:          z.string().nullable().optional(),
  shares_pct:     z.number().positive(),
  status:         z.string().default('pending'),
  invoice_amount: z.number().default(0),
  paid_amount:    z.number().default(0),
  remarks:        z.string().nullable().optional(),
})

const bodySchema = z.object({
  horse: horseSchema,
  rows:  z.array(rowSchema),
})

export async function POST(req: Request) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Validation error' }, { status: 422 })
  }

  const { horse: horseInput, rows } = parsed.data
  const supabase = await createServerSupabaseClient()

  // 1. Insert horse
  const { data: horse, error: horseError } = await supabase
    .from('horses')
    .insert(horseInput)
    .select('id')
    .single()

  if (horseError || !horse) {
    return NextResponse.json({ error: horseError?.message ?? 'Failed to create horse' }, { status: 500 })
  }

  const horseId = horse.id
  let matchedCustomers = 0
  let createdCustomers = 0
  let insertedBuyers = 0
  const warnings: string[] = []

  // 2. For each row: find-or-create customer, insert buyer
  for (const row of rows) {
    try {
      const { id: customerId, created } = await findOrCreateCustomer(supabase, {
        email: row.email ?? undefined,
        firstName: row.first_name,
        lastName: row.last_name ?? undefined,
        phone: row.phone ?? undefined,
      })

      if (created) createdCustomers++
      else matchedCustomers++

      const { error: buyerError } = await supabase.from('buyers').insert({
        horse_id:       horseId,
        customer_id:    customerId,
        first_name:     row.first_name,
        last_name:      row.last_name ?? null,
        email:          row.email ?? null,
        phone:          row.phone ?? null,
        shares_pct:     row.shares_pct,
        status:         row.status as never,
        invoice_amount: row.invoice_amount,
        paid_amount:    row.paid_amount,
        remarks:        row.remarks ?? null,
      })

      if (buyerError) {
        warnings.push(`Failed to insert buyer ${row.first_name}: ${buyerError.message}`)
      } else {
        insertedBuyers++
      }
    } catch (e) {
      warnings.push(`Error processing ${row.first_name}: ${e instanceof Error ? e.message : 'Unknown error'}`)
    }
  }

  await writeAuditLog({
    action: 'import',
    entity: 'import',
    entity_id: horseId,
    user_id: user.id,
    user_email: user.email ?? undefined,
    payload: { horseId, insertedBuyers, matchedCustomers, createdCustomers, horse: horseInput.display_name },
  })

  await writeAuditLog({
    action: 'create',
    entity: 'horse',
    entity_id: horseId,
    user_id: user.id,
    user_email: user.email ?? undefined,
    payload: { display_name: horseInput.display_name, source: 'syndication_import' },
  })

  return NextResponse.json({ horseId, insertedBuyers, matchedCustomers, createdCustomers, warnings })
}
