import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20).optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  ADMIN_EMAIL_ALLOWLIST: z.string().optional(),
  NEXT_PUBLIC_DEFAULT_CURRENCY: z.string().default('AUD'),
})

function parseEnv() {
  const result = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    ADMIN_EMAIL_ALLOWLIST: process.env.ADMIN_EMAIL_ALLOWLIST,
    NEXT_PUBLIC_DEFAULT_CURRENCY: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY,
  })

  if (!result.success) {
    console.error('Invalid environment variables:', result.error.flatten())
    throw new Error('Invalid environment variables')
  }

  return result.data
}

// Lazy singleton — parse once, throw at startup if invalid
let _env: ReturnType<typeof parseEnv> | undefined

export function getEnv() {
  if (!_env) _env = parseEnv()
  return _env
}

// Shorthand for NEXT_PUBLIC_ vars safe to use in both server and client
export const env = {
  get supabaseUrl() { return process.env.NEXT_PUBLIC_SUPABASE_URL! },
  get supabaseAnonKey() { return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
  get siteUrl() { return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000' },
  get defaultCurrency() { return process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? 'AUD' },
}
