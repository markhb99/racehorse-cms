import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../database.types'
import type { Buyer } from '../../types'
import type { BuyerStatusKey } from '../../constants'

type Client = SupabaseClient<Database>

export async function getBuyersByHorse(
  client: Client,
  horseId: string,
): Promise<Buyer[]> {
  const { data, error } = await client
    .from('buyers')
    .select('*')
    .eq('horse_id', horseId)
    .order('shares_pct', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}
