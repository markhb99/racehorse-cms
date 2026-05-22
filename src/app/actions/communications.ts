'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server'
import { ok, fail } from '@/lib/result'
import type { Result } from '@/lib/result'
import { writeAuditLog } from './audit'

async function requireUser() {
  const user = await getServerUser()
  if (!user) throw new Error('Unauthenticated')
  return user
}

const addCommSchema = z.object({
  customer_id: z.string().uuid(),
  type: z.enum(['call', 'email', 'sms', 'meeting', 'note', 'document']),
  direction: z.enum(['inbound', 'outbound', 'na']).default('na'),
  occurred_at: z.string().datetime().optional(),
  subject: z.string().max(255).nullish(),
  body: z.string().nullish(),
  follow_up_at: z.string().datetime().nullish(),
})

const updateCommSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['call', 'email', 'sms', 'meeting', 'note', 'document']).optional(),
  direction: z.enum(['inbound', 'outbound', 'na']).optional(),
  occurred_at: z.string().datetime().optional(),
  subject: z.string().max(255).nullish(),
  body: z.string().nullish(),
  follow_up_at: z.string().datetime().nullish(),
})

export async function addCommunication(input: unknown): Promise<Result<{ id: string }>> {
  const user = await requireUser()

  const parsed = addCommSchema.safeParse(input)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return fail(first.message, first.path[0]?.toString())
  }

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('customer_communications')
    .insert({ ...parsed.data, created_by: user.id })
    .select('id')
    .single()

  if (error) return fail(error.message, undefined, 'db_error')

  await writeAuditLog({
    action: 'create',
    entity: 'customer_communication',
    entity_id: data.id,
    user_id: user.id,
    user_email: user.email,
    payload: { customer_id: parsed.data.customer_id, type: parsed.data.type },
  })

  revalidatePath(`/customers/${parsed.data.customer_id}`)
  if (parsed.data.follow_up_at) revalidatePath('/')
  return ok({ id: data.id })
}

export async function updateCommunication(input: unknown): Promise<Result<null>> {
  const user = await requireUser()

  const parsed = updateCommSchema.safeParse(input)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return fail(first.message, first.path[0]?.toString())
  }

  const { id, ...rest } = parsed.data
  const supabase = await createServerSupabaseClient()

  const { data: existing } = await supabase
    .from('customer_communications')
    .select('customer_id')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('customer_communications')
    .update(rest)
    .eq('id', id)

  if (error) return fail(error.message, undefined, 'db_error')

  await writeAuditLog({
    action: 'update',
    entity: 'customer_communication',
    entity_id: id,
    user_id: user.id,
    user_email: user.email,
  })

  if (existing?.customer_id) revalidatePath(`/customers/${existing.customer_id}`)
  revalidatePath('/')
  return ok(null)
}

export async function deleteCommunication(input: { id: string }): Promise<Result<null>> {
  const user = await requireUser()
  if (!input.id) return fail('Communication ID is required')

  const supabase = await createServerSupabaseClient()

  const { data: existing } = await supabase
    .from('customer_communications')
    .select('customer_id')
    .eq('id', input.id)
    .single()

  const { error } = await supabase
    .from('customer_communications')
    .delete()
    .eq('id', input.id)

  if (error) return fail(error.message, undefined, 'db_error')

  await writeAuditLog({
    action: 'delete',
    entity: 'customer_communication',
    entity_id: input.id,
    user_id: user.id,
    user_email: user.email,
  })

  if (existing?.customer_id) revalidatePath(`/customers/${existing.customer_id}`)
  revalidatePath('/')
  return ok(null)
}

export async function completeFollowUp(input: { id: string }): Promise<Result<null>> {
  const user = await requireUser()
  if (!input.id) return fail('Communication ID is required')

  const supabase = await createServerSupabaseClient()

  const { data: existing } = await supabase
    .from('customer_communications')
    .select('customer_id')
    .eq('id', input.id)
    .single()

  const { error } = await supabase
    .from('customer_communications')
    .update({ follow_up_completed_at: new Date().toISOString() })
    .eq('id', input.id)

  if (error) return fail(error.message, undefined, 'db_error')

  await writeAuditLog({
    action: 'update',
    entity: 'customer_communication',
    entity_id: input.id,
    user_id: user.id,
    user_email: user.email,
    payload: { follow_up_completed: true },
  })

  if (existing?.customer_id) revalidatePath(`/customers/${existing.customer_id}`)
  revalidatePath('/')
  return ok(null)
}
