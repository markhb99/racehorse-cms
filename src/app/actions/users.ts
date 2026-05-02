'use server'

import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { getServerUser } from '@/lib/supabase/server'
import { ok, fail } from '@/lib/result'
import type { Result } from '@/lib/result'
import { z } from 'zod'

async function requireAdmin() {
  const user = await getServerUser()
  if (!user) throw new Error('Not authenticated')
  return user
}

export interface AdminUser {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
}

export async function listUsers(): Promise<Result<AdminUser[]>> {
  await requireAdmin()
  const admin = createAdminSupabaseClient()
  const { data, error } = await admin.auth.admin.listUsers()
  if (error) return fail(error.message)
  return ok(
    data.users.map((u) => ({
      id: u.id,
      email: u.email ?? '(no email)',
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
    })),
  )
}

const inviteSchema = z.object({ email: z.string().email('Invalid email address') })

export async function inviteUser(input: unknown): Promise<Result<void>> {
  await requireAdmin()
  const parsed = inviteSchema.safeParse(input)
  if (!parsed.success) return fail(parsed.error.issues[0].message)

  const admin = createAdminSupabaseClient()
  const { error } = await admin.auth.admin.inviteUserByEmail(parsed.data.email)
  if (error) return fail(error.message)
  return ok(undefined)
}

export async function deleteUser(input: unknown): Promise<Result<void>> {
  const currentUser = await requireAdmin()
  const parsed = z.object({ id: z.string().uuid() }).safeParse(input)
  if (!parsed.success) return fail('Invalid user ID')
  if (parsed.data.id === currentUser.id) return fail('You cannot delete your own account')

  const admin = createAdminSupabaseClient()
  const { error } = await admin.auth.admin.deleteUser(parsed.data.id)
  if (error) return fail(error.message)
  return ok(undefined)
}
