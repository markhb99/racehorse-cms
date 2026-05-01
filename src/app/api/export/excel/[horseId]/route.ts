import { NextResponse, type NextRequest } from 'next/server'
import { getServerUser } from '@/lib/supabase/server'

interface Params {
  params: Promise<{ horseId: string }>
}

// Phase 5 implements full Excel export
export async function GET(_request: NextRequest, { params }: Params) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ ok: false, error: 'Unauthorised' }, { status: 401 })

  const { horseId } = await params
  if (!horseId) return NextResponse.json({ ok: false, error: 'Missing horseId' }, { status: 400 })

  return NextResponse.json(
    { ok: false, error: 'Excel export not yet implemented — coming in Phase 5' },
    { status: 501 },
  )
}
