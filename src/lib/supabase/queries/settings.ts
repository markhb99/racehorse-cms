import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../database.types'

type Client = SupabaseClient<Database>

export async function getSetting(
  client: Client,
  key: string,
): Promise<string | null> {
  const { data, error } = await client
    .from('settings')
    .select('value')
    .eq('key', key)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data?.value ?? null
}

export async function getAllSettings(
  client: Client,
): Promise<Record<string, string>> {
  const { data, error } = await client.from('settings').select('key, value')
  if (error) return {}
  return Object.fromEntries((data ?? []).map(({ key, value }) => [key, value]))
}
