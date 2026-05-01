'use server'

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { signInSchema } from '@/lib/schemas/auth'
import { fail } from '@/lib/result'
import type { Result } from '@/lib/result'

export async function signIn(input: unknown): Promise<Result<void>> {
  const parsed = signInSchema.safeParse(input)
  if (!parsed.success) {
    return fail('Invalid email or password', undefined, 'validation_error')
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return fail(
      error.message === 'Invalid login credentials'
        ? 'Incorrect email or password'
        : error.message,
      undefined,
      'auth_error',
    )
  }

  redirect('/')
}
