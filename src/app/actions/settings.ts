'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server'
import { ok, fail } from '@/lib/result'
import type { Result } from '@/lib/result'

async function requireUser() {
  const user = await getServerUser()
  if (!user) throw new Error('Unauthenticated')
  return user
}

export async function updateSetting(input: {
  key: string
  value: string
}): Promise<Result<void>> {
  await requireUser()
  if (!input.key) return fail('Setting key is required')

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('settings')
    .upsert({ key: input.key, value: input.value })

  if (error) return fail(error.message, undefined, 'db_error')

  revalidatePath('/settings')
  revalidatePath('/', 'layout')
  return ok(undefined)
}

export async function changePassword(input: unknown): Promise<Result<null>> {
  await requireUser()

  const schema = z
    .object({
      password:        z.string().min(8, 'Password must be at least 8 characters'),
      confirmPassword: z.string(),
    })
    .refine((d) => d.password === d.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    })

  const parsed = schema.safeParse(input)
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Invalid')

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
  if (error) return fail(error.message)

  return ok(null)
}
