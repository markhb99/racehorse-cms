import { NextResponse, type NextRequest } from 'next/server'
import { getServerUser } from '@/lib/supabase/server'

// Phase 5 implements full import logic
export async function POST(_request: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ ok: false, error: 'Unauthorised' }, { status: 401 })

  return NextResponse.json(
    { ok: false, error: 'Import not yet implemented — coming in Phase 5' },
    { status: 501 },
  )
}
