'use server'

import { revalidatePath } from 'next/cache'
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
