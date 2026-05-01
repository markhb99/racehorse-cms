import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server'
import { importPayloadSchema } from '@/lib/schemas/import'
import { normalizeFullName } from '@/lib/import/upsert-strategy'

export async function POST(request: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ ok: false, error: 'Unauthorised' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = importPayloadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid payload' },
      { status: 422 },
    )
  }

  const { horseId, rows } = parsed.data
  const supabase = await createServerSupabaseClient()

  // Verify horse exists
  const { data: horse, error: horseErr } = await supabase
    .from('horses')
    .select('id')
    .eq('id', horseId)
    .single()
  if (horseErr || !horse) {
    return NextResponse.json({ ok: false, error: 'Horse not found' }, { status: 404 })
  }

  // Fetch existing buyers to determine insert vs update
  const { data: existing, error: fetchErr } = await supabase
    .from('buyers')
    .select('id, first_name, last_name')
    .eq('horse_id', horseId)
  if (fetchErr) {
    return NextResponse.json({ ok: false, error: 'Failed to fetch existing buyers' }, { status: 500 })
  }

  // Build a lookup map: normalizedName → buyer id
  const existingMap = new Map<string, string>()
  for (const b of existing ?? []) {
    existingMap.set(normalizeFullName(b.first_name, b.last_name), b.id)
  }

  let inserted = 0
  let updated = 0

  for (const row of rows) {
    const key = normalizeFullName(row.first_name, row.last_name)
    const existingId = existingMap.get(key)

    if (existingId) {
      // Update existing buyer
      const { error } = await supabase
        .from('buyers')
        .update({
          email:          row.email ?? null,
          phone:          row.phone ?? null,
          shares_pct:     row.shares_pct,
          status:         row.status,
          invoice_amount: row.invoice_amount,
          paid_amount:    row.paid_amount,
          remarks:        row.remarks ?? null,
        })
        .eq('id', existingId)

      if (!error) updated++
    } else {
      // Insert new buyer
      const { error } = await supabase.from('buyers').insert({
        horse_id:       horseId,
        first_name:     row.first_name,
        last_name:      row.last_name ?? null,
        email:          row.email ?? null,
        phone:          row.phone ?? null,
        shares_pct:     row.shares_pct,
        status:         row.status,
        invoice_amount: row.invoice_amount,
        paid_amount:    row.paid_amount,
        remarks:        row.remarks ?? null,
      })

      if (!error) inserted++
    }
  }

  return NextResponse.json({ ok: true, inserted, updated })
}
