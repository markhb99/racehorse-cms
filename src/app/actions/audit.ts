'use server'

import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import type { AuditAction, AuditEntity } from '@/lib/types'

interface WriteAuditLogInput {
  action: AuditAction
  entity: AuditEntity
  entity_id?: string
  payload?: Record<string, unknown>
  user_id?: string
  user_email?: string
}

export async function writeAuditLog(input: WriteAuditLogInput): Promise<void> {
  try {
    const admin = createAdminSupabaseClient()
    await admin.from('audit_log').insert({
      action: input.action,
      entity: input.entity,
      entity_id: input.entity_id ?? null,
      payload: input.payload ?? null,
      user_id: input.user_id ?? null,
      user_email: input.user_email ?? null,
    })
  } catch {
    // Audit log failures must never crash the caller
  }
}
