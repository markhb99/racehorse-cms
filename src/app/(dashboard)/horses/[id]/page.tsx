import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getHorseById } from '@/lib/supabase/queries/horses'
import { getBuyersByHorse } from '@/lib/supabase/queries/buyers'
import { HorseDetailClient } from './horse-detail-client'

interface HorseDetailPageProps {
  params: Promise<{ id: string }>
}

export const metadata = { title: 'Horse' }

export default async function HorseDetailPage({ params }: HorseDetailPageProps) {
  const { id } = await params

  const supabase = await createServerSupabaseClient()
  const [horse, buyers] = await Promise.all([
    getHorseById(supabase, id),
    getBuyersByHorse(supabase, id),
  ])

  if (!horse) notFound()

  return <HorseDetailClient horse={horse} buyers={buyers} />
}
