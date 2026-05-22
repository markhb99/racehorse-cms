import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { AuditLogTable } from '@/components/audit/audit-log-table'

export const metadata = { title: 'Audit Log' }

const PAGE_SIZE = 50

interface PageProps {
  searchParams: Promise<{
    entity?: string
    action?: string
    page?: string
  }>
}

export default async function AuditLogPage({ searchParams }: PageProps) {
  const params = await searchParams
  const entity = params.entity ?? ''
  const action = params.action ?? ''
  const page = Math.max(0, Number(params.page ?? 0))

  const admin = createAdminSupabaseClient()

  let query = admin
    .from('audit_log')
    .select('*')
    .order('occurred_at', { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

  type AuditEntity = 'horse' | 'buyer' | 'customer' | 'customer_communication' | 'setting' | 'user' | 'export' | 'login' | 'logout' | 'import'
  type AuditAction = 'create' | 'update' | 'delete' | 'soft_delete' | 'restore' | 'forget' | 'export' | 'view' | 'login' | 'logout' | 'consent_granted' | 'consent_revoked' | 'import'

  if (entity) query = query.eq('entity', entity as AuditEntity)
  if (action) query = query.eq('action', action as AuditAction)

  const { data: rows } = await query

  const ENTITIES = ['horse','buyer','customer','customer_communication','setting','user','export','import']
  const ACTIONS  = ['create','update','delete','soft_delete','restore','forget','export','view','import','consent_granted','consent_revoked']

  return (
    <div className="space-y-4 max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight">Audit Log</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form className="flex gap-2 flex-wrap">
          <select
            name="entity"
            defaultValue={entity}
            className="rounded-md border bg-background px-3 py-1.5 text-sm"
          >
            <option value="">All entities</option>
            {ENTITIES.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <select
            name="action"
            defaultValue={action}
            className="rounded-md border bg-background px-3 py-1.5 text-sm"
          >
            <option value="">All actions</option>
            {ACTIONS.map((a) => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
          </select>
          <button
            type="submit"
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Filter
          </button>
          <a
            href="/settings/audit"
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
          >
            Clear
          </a>
        </form>
      </div>

      <AuditLogTable rows={rows ?? []} />

      {/* Pagination */}
      <div className="flex justify-between text-sm">
        {page > 0 ? (
          <a
            href={`/settings/audit?entity=${entity}&action=${action}&page=${page - 1}`}
            className="text-primary hover:underline"
          >
            ← Previous
          </a>
        ) : <span />}
        {(rows?.length ?? 0) === PAGE_SIZE && (
          <a
            href={`/settings/audit?entity=${entity}&action=${action}&page=${page + 1}`}
            className="text-primary hover:underline"
          >
            Next →
          </a>
        )}
      </div>
    </div>
  )
}
