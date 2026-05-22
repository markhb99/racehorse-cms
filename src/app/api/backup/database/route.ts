import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server'
import { exportFullBackup } from '@/lib/export/export-to-excel'

export async function GET(request: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ ok: false, error: 'Unauthorised' }, { status: 401 })

  const format = request.nextUrl.searchParams.get('format') === 'xlsx' ? 'xlsx' : 'json'
  const supabase = await createServerSupabaseClient()

  const [horsesRes, buyersRes, settingsRes] = await Promise.all([
    supabase.from('horses').select('*').order('created_at'),
    supabase.from('buyers').select('*').order('created_at'),
    supabase.from('settings').select('*'),
  ])

  const firstError = horsesRes.error ?? buyersRes.error ?? settingsRes.error
  if (firstError) {
    return NextResponse.json({ ok: false, error: firstError.message }, { status: 500 })
  }

  const horses = horsesRes.data ?? []
  const buyers = buyersRes.data ?? []
  const settings = settingsRes.data ?? []
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')

  if (format === 'xlsx') {
    const buffer = exportFullBackup({ horses, buyers, settings })
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="racehorse-backup-${stamp}.xlsx"`,
      },
    })
  }

  const body = JSON.stringify(
    {
      exported_at: new Date().toISOString(),
      app: 'racehorse-cms',
      counts: { horses: horses.length, buyers: buyers.length, settings: settings.length },
      tables: { horses, buyers, settings },
    },
    null,
    2,
  )

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="racehorse-backup-${stamp}.json"`,
    },
  })
}
