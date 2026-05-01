/**
 * Create the admin user via the Supabase service role.
 * Run once during initial setup:
 *
 *   SUPABASE_SERVICE_ROLE_KEY=... NEXT_PUBLIC_SUPABASE_URL=... \
 *     npx ts-node --project tsconfig.json scripts/create-admin.ts
 *
 * Preferred alternative: use the Supabase Dashboard → Authentication → Users
 */

import { createClient } from '@supabase/supabase-js'

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }
  if (!email || !password) {
    console.error('Missing ADMIN_EMAIL or ADMIN_PASSWORD')
    process.exit(1)
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) {
    console.error('Failed to create admin user:', error.message)
    process.exit(1)
  }

  console.log('Admin user created:', data.user?.email)
}

main()
