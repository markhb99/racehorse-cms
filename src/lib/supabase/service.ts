import { createClient } from '@supabase/supabase-js'
import type { Database } from '../database.types'

// Service-role client — bypasses RLS. Server-only. Never use in browser.
export function createServiceClient() {
  if (typeof window !== 'undefined') {
    throw new Error('createServiceClient must only be called on the server')
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set to use the service client',
    )
  }

  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
