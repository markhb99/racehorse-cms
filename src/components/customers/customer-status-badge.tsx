import { cn } from '@/lib/utils'
import type { CustomerStatus } from '@/lib/types'

const STYLES: Record<CustomerStatus, string> = {
  prospect:  'bg-blue-50 text-blue-700 border-blue-200',
  active:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  lapsed:    'bg-amber-50 text-amber-700 border-amber-200',
  archived:  'bg-slate-100 text-slate-500 border-slate-200',
}

const LABELS: Record<CustomerStatus, string> = {
  prospect: 'Prospect',
  active:   'Active',
  lapsed:   'Lapsed',
  archived: 'Archived',
}

export function CustomerStatusBadge({ status }: { status: CustomerStatus }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', STYLES[status])}>
      {LABELS[status]}
    </span>
  )
}
