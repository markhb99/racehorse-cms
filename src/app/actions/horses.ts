'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server'
import { createHorseSchema, updateHorseSchema } from '@/lib/schemas/horse'
import { ok, fail } from '@/lib/result'
import type { Result } from '@/lib/result'

async function requireUser() {
  const user = await getServerUser()
  if (!user) throw new Error('Unauthenticated')
  return user
}

export async function createHorse(input: unknown): Promise<Result<{ id: string }>> {
  await requireUser()

  const parsed = createHorseSchema.safeParse(input)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]
    return fail(firstError.message, firstError.path[0]?.toString())
  }

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('horses')
    .insert(parsed.data)
    .select('id')
    .single()

  if (error) return fail(error.message, undefined, 'db_error')

  revalidatePath('/horses')
  revalidatePath('/')
  return ok({ id: data.id })
}

export async function updateHorse(
  input: unknown,
): Promise<Result<{ id: string }>> {
  await requireUser()

  const { id, ...rest } = input as { id: string } & Record<string, unknown>
  if (!id) return fail('Horse ID is required')

  const parsed = updateHorseSchema.safeParse(rest)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]
    return fail(firstError.message, firstError.path[0]?.toString())
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('horses')
    .update(parsed.data)
    .eq('id', id)

  if (error) return fail(error.message, undefined, 'db_error')

  revalidatePath('/horses')
  revalidatePath(`/horses/${id}`)
  revalidatePath('/')
  return ok({ id })
}

export async function archiveHorse(input: { id: string }): Promise<Result<null>> {
  await requireUser()
  if (!input.id) return fail('Horse ID is required')

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('horses')
    .update({ status: 'archived' })
    .eq('id', input.id)

  if (error) return fail(error.message, undefined, 'db_error')

  revalidatePath('/horses')
  revalidatePath('/')
  return ok(null)
}

export async function restoreHorse(input: { id: string }): Promise<Result<null>> {
  await requireUser()
  if (!input.id) return fail('Horse ID is required')

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('horses')
    .update({ status: 'active' })
    .eq('id', input.id)

  if (error) return fail(error.message, undefined, 'db_error')

  revalidatePath('/horses')
  revalidatePath('/settings')
  revalidatePath('/')
  return ok(null)
}

export async function deleteHorse(input: {
  id: string
  confirmName: string
}): Promise<Result<null>> {
  await requireUser()
  if (!input.id) return fail('Horse ID is required')

  const supabase = await createServerSupabaseClient()

  // Server-side name confirmation guard
  const { data: horse, error: fetchError } = await supabase
    .from('horses')
    .select('display_name')
    .eq('id', input.id)
    .single()

  if (fetchError || !horse) return fail('Horse not found', undefined, 'not_found')

  if (
    horse.display_name.trim().toLowerCase() !==
    input.confirmName.trim().toLowerCase()
  ) {
    return fail('Name does not match', 'confirmName', 'name_mismatch')
  }

  const { error } = await supabase.from('horses').delete().eq('id', input.id)
  if (error) return fail(error.message, undefined, 'db_error')

  revalidatePath('/horses')
  revalidatePath('/')
  return ok(null)
}
