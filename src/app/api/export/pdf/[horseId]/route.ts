import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server'
import { getHorseById } from '@/lib/supabase/queries/horses'
import { getBuyersByHorse } from '@/lib/supabase/queries/buyers'
import { computeHorseStats } from '@/lib/kpis'
import { generateReport } from '@/lib/export/generate-report'

interface Params {
  params: Promise<{ horseId: string }>
}

export async function GET(_request: NextRequest, { params }: Params) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ ok: false, error: 'Unauthorised' }, { status: 401 })

  const { horseId } = await params
  if (!horseId) return NextResponse.json({ ok: false, error: 'Missing horseId' }, { status: 400 })

  const supabase = await createServerSupabaseClient()
  const [horse, buyers] = await Promise.all([
    getHorseById(supabase, horseId),
    getBuyersByHorse(supabase, horseId),
  ])

  if (!horse) return NextResponse.json({ ok: false, error: 'Horse not found' }, { status: 404 })

  const stats = computeHorseStats(buyers)
  const buffer = await generateReport(horse, buyers, stats)
  const safeName = horse.display_name.replace(/[^a-z0-9]/gi, '_')

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${safeName}_report.pdf"`,
    },
  })
}
