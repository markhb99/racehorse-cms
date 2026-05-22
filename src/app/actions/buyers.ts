'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server'
import {
  createBuyerSchema,
  updateBuyerSchema,
  bulkUpdateStatusSchema,
} from '@/lib/schemas/buyer'
import { ok, fail } from '@/lib/result'
import type { Result } from '@/lib/result'

async function requireUser() {
  const user = await getServerUser()
  if (!user) throw new Error('Unauthenticated')
  return user
}

export async function createBuyer(input: unknown): Promise<Result<{ id: string }>> {
  await requireUser()

  const parsed = createBuyerSchema.safeParse(input)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]
    return fail(firstError.message, firstError.path[0]?.toString())
  }

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('buyers')
    .insert(parsed.data)
    .select('id')
    .single()

  if (error) return fail(error.message, undefined, 'db_error')

  revalidatePath(`/horses/${parsed.data.horse_id}`)
  revalidatePath('/')
  return ok({ id: data.id })
}

export async function updateBuyer(
  input: unknown,
): Promise<Result<{ id: string }>> {
  await requireUser()

  const { id, horse_id, ...rest } = input as {
    id: string
    horse_id: string
  } & Record<string, unknown>

  if (!id) return fail('Buyer ID is required')

  const parsed = updateBuyerSchema.safeParse(rest)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]
    return fail(firstError.message, firstError.path[0]?.toString())
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('buyers').update(parsed.data).eq('id', id)

  if (error) return fail(error.message, undefined, 'db_error')

  if (horse_id) {
    revalidatePath(`/horses/${horse_id}`)
    revalidatePath('/')
  }
  return ok({ id })
}

export async function deleteBuyer(input: {
  id: string
  horse_id: string
}): Promise<Result<null>> {
  await requireUser()
  if (!input.id) return fail('Buyer ID is required')

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('buyers').delete().eq('id', input.id)

  if (error) return fail(error.message, undefined, 'db_error')

  revalidatePath(`/horses/${input.horse_id}`)
  revalidatePath('/')
  return ok(null)
}

export async function bulkUpdateBuyerStatus(
  input: unknown,
): Promise<Result<{ count: number }>> {
  await requireUser()

  const parsed = bulkUpdateStatusSchema.safeParse(input)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]
    return fail(firstError.message, firstError.path[0]?.toString())
  }

  const supabase = await createServerSupabaseClient()
  const { error, count } = await supabase
    .from('buyers')
    .update({ status: parsed.data.status })
    .in('id', parsed.data.ids)

  if (error) return fail(error.message, undefined, 'db_error')

  // Revalidate — we don't know horse IDs so revalidate all
  revalidatePath('/horses', 'layout')
  revalidatePath('/')
  return ok({ count: count ?? parsed.data.ids.length })
}
