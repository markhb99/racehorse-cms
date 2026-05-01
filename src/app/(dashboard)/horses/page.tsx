import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getHorses } from '@/lib/supabase/queries/horses'
import { HorsesPageClient } from './horses-page-client'
import type { HorseStatus } from '@/lib/types'

export const metadata = { title: 'Horses' }

const VALID_STATUSES = new Set(['active', 'sold', 'archived', 'all'])

interface HorsesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function HorsesPage({ searchParams }: HorsesPageProps) {
  const params = await searchParams
  const rawStatus = Array.isArray(params.status) ? params.status[0] : params.status
  const status = VALID_STATUSES.has(rawStatus ?? '') ? (rawStatus as HorseStatus | 'all') : 'active'

  const supabase = await createServerSupabaseClient()
  const horses = await getHorses(supabase, { status })

  return <HorsesPageClient horses={horses} status={status as 'active' | 'sold' | 'archived' | 'all'} />
}
