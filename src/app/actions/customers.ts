'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server'
import { ok, fail } from '@/lib/result'
import type { Result } from '@/lib/result'
import { writeAuditLog } from './audit'
import { TERMINAL_STATUSES } from '@/lib/constants'

async function requireUser() {
  const user = await getServerUser()
  if (!user) throw new Error('Unauthenticated')
  return user
}

const customerSchema = z.object({
  legal_first_name: z.string().min(1).max(80),
  legal_last_name: z.string().max(80).nullish(),
  display_name: z.string().min(1).max(160),
  entity_type: z.enum(['individual', 'company', 'trust', 'partnership', 'super_fund']).default('individual'),
  email: z.string().email().nullish().or(z.literal('')),
  phone: z.string().max(40).nullish(),
  address_line1: z.string().max(120).nullish(),
  address_line2: z.string().max(120).nullish(),
  suburb: z.string().max(80).nullish(),
  state: z.string().max(40).nullish(),
  postcode: z.string().regex(/^[0-9]{4}$/).nullish().or(z.literal('')),
  country: z.string().max(3).default('AU'),
  abn: z.string().regex(/^[0-9]{11}$/).nullish().or(z.literal('')),
  acn: z.string().regex(/^[0-9]{9}$/).nullish().or(z.literal('')),
  date_of_birth: z.string().nullish(),
  notes: z.string().nullish(),
  status: z.enum(['prospect', 'active', 'lapsed', 'archived']).default('active'),
  tags: z.array(z.string()).default([]),
})

function nullifyEmpty<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    result[k] = v === '' ? null : v
  }
  return result as T
}

export async function createCustomer(input: unknown): Promise<Result<{ id: string }>> {
  const user = await requireUser()

  const parsed = customerSchema.safeParse(input)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return fail(first.message, first.path[0]?.toString())
  }

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('customers')
    .insert(nullifyEmpty(parsed.data) as typeof parsed.data)
    .select('id')
    .single()

  if (error) return fail(error.message, undefined, 'db_error')

  await writeAuditLog({
    action: 'create',
    entity: 'customer',
    entity_id: data.id,
    user_id: user.id,
    user_email: user.email,
    payload: { display_name: parsed.data.display_name },
  })

  revalidatePath('/customers')
  revalidatePath('/')
  return ok({ id: data.id })
}

export async function updateCustomer(input: unknown): Promise<Result<null>> {
  const user = await requireUser()

  const { id, ...rest } = input as { id: string } & Record<string, unknown>
  if (!id) return fail('Customer ID is required')

  const parsed = customerSchema.partial().safeParse(rest)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return fail(first.message, first.path[0]?.toString())
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('customers')
    .update(nullifyEmpty(parsed.data) as typeof parsed.data)
    .eq('id', id)
    .is('deleted_at', null)

  if (error) return fail(error.message, undefined, 'db_error')

  await writeAuditLog({
    action: 'update',
    entity: 'customer',
    entity_id: id,
    user_id: user.id,
    user_email: user.email,
  })

  revalidatePath('/customers')
  revalidatePath(`/customers/${id}`)
  return ok(null)
}

export async function archiveCustomer(input: { id: string }): Promise<Result<null>> {
  const user = await requireUser()
  if (!input.id) return fail('Customer ID is required')

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('customers')
    .update({ status: 'archived' })
    .eq('id', input.id)
    .is('deleted_at', null)

  if (error) return fail(error.message, undefined, 'db_error')

  await writeAuditLog({ action: 'update', entity: 'customer', entity_id: input.id, user_id: user.id, user_email: user.email, payload: { status: 'archived' } })
  revalidatePath('/customers')
  revalidatePath(`/customers/${input.id}`)
  return ok(null)
}

export async function restoreCustomer(input: { id: string }): Promise<Result<null>> {
  const user = await requireUser()
  if (!input.id) return fail('Customer ID is required')

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('customers')
    .update({ status: 'active', deleted_at: null })
    .eq('id', input.id)

  if (error) return fail(error.message, undefined, 'db_error')

  await writeAuditLog({ action: 'restore', entity: 'customer', entity_id: input.id, user_id: user.id, user_email: user.email })
  revalidatePath('/customers')
  return ok(null)
}

export async function softDeleteCustomer(input: { id: string }): Promise<Result<null>> {
  const user = await requireUser()
  if (!input.id) return fail('Customer ID is required')

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('customers')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', input.id)

  if (error) return fail(error.message, undefined, 'db_error')

  await writeAuditLog({ action: 'soft_delete', entity: 'customer', entity_id: input.id, user_id: user.id, user_email: user.email })
  revalidatePath('/customers')
  return ok(null)
}

export async function forgetCustomer(input: {
  id: string
  confirmName: string
}): Promise<Result<null>> {
  const user = await requireUser()
  if (!input.id) return fail('Customer ID is required')

  const supabase = await createServerSupabaseClient()

  const { data: customer, error: fetchError } = await supabase
    .from('customers')
    .select('display_name, email, phone')
    .eq('id', input.id)
    .single()

  if (fetchError || !customer) return fail('Customer not found', undefined, 'not_found')

  if (customer.display_name.trim().toLowerCase() !== input.confirmName.trim().toLowerCase()) {
    return fail('Name does not match', 'confirmName', 'name_mismatch')
  }

  // Guard: no non-terminal holdings
  const { data: nonTerminal } = await supabase
    .from('buyers')
    .select('id')
    .eq('customer_id', input.id)
    .not('status', 'in', `(${TERMINAL_STATUSES.map((s) => `"${s}"`).join(',')})`)

  if (nonTerminal && nonTerminal.length > 0) {
    return fail('Archive all active holdings before forgetting this customer', undefined, 'active_holdings')
  }

  await writeAuditLog({
    action: 'forget',
    entity: 'customer',
    entity_id: input.id,
    user_id: user.id,
    user_email: user.email,
    payload: { display_name: customer.display_name, email: customer.email },
  })

  // Nullify PII fields (APP 13 compliance)
  const { error } = await supabase
    .from('customers')
    .update({
      deleted_at: new Date().toISOString(),
      email: null,
      phone: null,
      address_line1: null,
      address_line2: null,
      suburb: null,
      state: null,
      postcode: null,
      date_of_birth: null,
      notes: null,
      marketing_consent: false,
      marketing_consent_at: null,
      marketing_consent_source: null,
    })
    .eq('id', input.id)

  if (error) return fail(error.message, undefined, 'db_error')

  revalidatePath('/customers')
  return ok(null)
}

export async function setMarketingConsent(input: {
  id: string
  consent: boolean
  source?: string
}): Promise<Result<null>> {
  const user = await requireUser()
  if (!input.id) return fail('Customer ID is required')

  const supabase = await createServerSupabaseClient()
  const now = new Date().toISOString()

  const { error } = await supabase
    .from('customers')
    .update({
      marketing_consent: input.consent,
      marketing_consent_at: input.consent ? now : null,
      marketing_consent_source: input.consent ? (input.source ?? 'Manual') : null,
    })
    .eq('id', input.id)
    .is('deleted_at', null)

  if (error) return fail(error.message, undefined, 'db_error')

  await writeAuditLog({
    action: input.consent ? 'consent_granted' : 'consent_revoked',
    entity: 'customer',
    entity_id: input.id,
    user_id: user.id,
    user_email: user.email,
    payload: { source: input.source },
  })

  revalidatePath('/customers')
  revalidatePath(`/customers/${input.id}`)
  return ok(null)
}
