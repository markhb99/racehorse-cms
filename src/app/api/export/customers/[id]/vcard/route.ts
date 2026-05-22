import { NextResponse } from 'next/server'
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server'
import { writeAuditLog } from '@/app/actions/audit'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: c, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error || !c) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${c.display_name}`,
    `N:${c.legal_last_name ?? ''};${c.legal_first_name};;;`,
    c.email   ? `EMAIL;TYPE=INTERNET:${c.email}`   : null,
    c.phone   ? `TEL;TYPE=CELL:${c.phone}`          : null,
    c.address_line1
      ? `ADR;TYPE=HOME:;;${c.address_line1};${c.suburb ?? ''};${c.state ?? ''};${c.postcode ?? ''};${c.country}`
      : null,
    c.entity_type !== 'individual' ? `ORG:${c.display_name}` : null,
    `NOTE:Racehorse CMS customer`,
    'END:VCARD',
  ].filter(Boolean).join('\r\n')

  await writeAuditLog({
    action: 'export',
    entity: 'customer',
    entity_id: id,
    user_id: user.id,
    user_email: user.email ?? undefined,
    payload: { format: 'vcard', display_name: c.display_name },
  })

  const filename = c.display_name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  return new NextResponse(lines, {
    headers: {
      'Content-Type': 'text/vcard',
      'Content-Disposition': `attachment; filename="${filename}.vcf"`,
    },
  })
}
