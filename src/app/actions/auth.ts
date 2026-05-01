'use server'

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { changePasswordSchema } from '@/lib/schemas/auth'
import { ok, fail } from '@/lib/result'
import type { Result } from '@/lib/result'

export async function signOut(): Promise<void> {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function changePassword(input: unknown): Promise<Result<void>> {
  const parsed = changePasswordSchema.safeParse(input)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]
    return fail(firstError.message, firstError.path[0]?.toString())
  }

  const supabase = await createServerSupabaseClient()

  // Verify current password by re-authenticating
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return fail('Not authenticated', undefined, 'unauthenticated')

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.currentPassword,
  })
  if (verifyError) return fail('Current password is incorrect', 'currentPassword')

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  })

  if (error) return fail(error.message, undefined, 'update_error')
  return ok(undefined)
}
