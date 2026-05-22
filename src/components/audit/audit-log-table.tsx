import type { AuditLog } from '@/lib/types'
import { cn } from '@/lib/utils'

const ACTION_STYLES: Record<string, string> = {
  create:          'bg-emerald-50 text-emerald-700',
  update:          'bg-blue-50 text-blue-700',
  delete:          'bg-red-50 text-red-700',
  soft_delete:     'bg-orange-50 text-orange-700',
  restore:         'bg-teal-50 text-teal-700',
  forget:          'bg-red-100 text-red-800',
  export:          'bg-violet-50 text-violet-700',
  view:            'bg-slate-50 text-slate-600',
  import:          'bg-indigo-50 text-indigo-700',
  consent_granted: 'bg-emerald-50 text-emerald-700',
  consent_revoked: 'bg-amber-50 text-amber-700',
  login:           'bg-slate-50 text-slate-600',
  logout:          'bg-slate-50 text-slate-600',
}

export function AuditLogTable({ rows }: { rows: AuditLog[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border py-12 text-center text-sm text-muted-foreground">
        No audit entries found.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/30">
          <tr>
            <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Time</th>
            <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">User</th>
            <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Action</th>
            <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Entity</th>
            <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-muted/20 transition-colors">
              <td className="px-3 py-2.5 whitespace-nowrap text-xs text-muted-foreground tabular-nums">
                {new Date(row.occurred_at).toLocaleString('en-AU', {
                  day: 'numeric', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </td>
              <td className="px-3 py-2.5 text-xs text-muted-foreground max-w-[140px] truncate">
                {row.user_email ?? '—'}
              </td>
              <td className="px-3 py-2.5">
                <span className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                  ACTION_STYLES[row.action] ?? 'bg-slate-50 text-slate-600',
                )}>
                  {row.action.replace(/_/g, ' ')}
                </span>
              </td>
              <td className="px-3 py-2.5 text-xs">
                <span className="font-medium">{row.entity}</span>
                {row.entity_id && (
                  <span className="ml-1 font-mono text-muted-foreground">
                    {row.entity_id.slice(0, 8)}…
                  </span>
                )}
              </td>
              <td className="px-3 py-2.5 text-xs text-muted-foreground max-w-[200px] truncate">
                {row.payload ? JSON.stringify(row.payload).slice(0, 80) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
