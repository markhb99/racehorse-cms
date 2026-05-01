import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../database.types'
import type { HorseStatus, HorseWithStats, Horse } from '../../types'
import { computeHorseStats } from '../../kpis'
import type { Buyer } from '../../types'

type Client = SupabaseClient<Database>

export async function getHorses(
  client: Client,
  opts?: { status?: HorseStatus | 'all' },
): Promise<HorseWithStats[]> {
  let query = client.from('horses').select('*').order('created_at', { ascending: false })

  if (opts?.status && opts.status !== 'all') {
    query = query.eq('status', opts.status)
  } else if (!opts?.status) {
    query = query.eq('status', 'active')
  }

  const { data: horses, error } = await query
  if (error) throw error
  if (!horses || horses.length === 0) return []

  const horseIds = horses.map((h) => h.id)
  const { data: buyers, error: buyerError } = await client
    .from('buyers')
    .select('*')
    .in('horse_id', horseIds)

  if (buyerError) throw buyerError

  const buyerMap = new Map<string, Buyer[]>()
  for (const buyer of buyers ?? []) {
    const list = buyerMap.get(buyer.horse_id) ?? []
    list.push(buyer)
    buyerMap.set(buyer.horse_id, list)
  }

  return horses.map((horse) => ({
    ...horse,
    stats: computeHorseStats(buyerMap.get(horse.id) ?? []),
  }))
}

export async function getHorseById(
  client: Client,
  id: string,
): Promise<HorseWithStats | null> {
  const { data: horse, error } = await client
    .from('horses')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  if (!horse) return null

  const { data: buyers, error: buyerError } = await client
    .from('buyers')
    .select('*')
    .eq('horse_id', id)
    .order('shares_pct', { ascending: false })

  if (buyerError) throw buyerError

  return { ...horse, stats: computeHorseStats(buyers ?? []) }
}

export async function getArchivedHorses(client: Client): Promise<HorseWithStats[]> {
  return getHorses(client, { status: 'archived' })
}

export async function getAllActiveHorsesWithBuyers(
  client: Client,
): Promise<{ horses: Horse[]; buyersByHorse: Map<string, Buyer[]> }> {
  const { data: horses, error } = await client
    .from('horses')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) throw error
  if (!horses || horses.length === 0) {
    return { horses: [], buyersByHorse: new Map() }
  }

  const horseIds = horses.map((h) => h.id)
  const { data: buyers, error: buyerError } = await client
    .from('buyers')
    .select('*')
    .in('horse_id', horseIds)

  if (buyerError) throw buyerError

  const buyersByHorse = new Map<string, Buyer[]>()
  for (const buyer of buyers ?? []) {
    const list = buyersByHorse.get(buyer.horse_id) ?? []
    list.push(buyer)
    buyersByHorse.set(buyer.horse_id, list)
  }

  return { horses, buyersByHorse }
}
