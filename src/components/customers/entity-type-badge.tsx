import { cn } from '@/lib/utils'
import type { CustomerEntityType } from '@/lib/types'

const LABELS: Record<CustomerEntityType, string> = {
  individual:   'Individual',
  company:      'Company',
  trust:        'Trust',
  partnership:  'Partnership',
  super_fund:   'Super Fund',
}

export function EntityTypeBadge({ entityType, className }: { entityType: CustomerEntityType; className?: string }) {
  if (entityType === 'individual') return null
  return (
    <span className={cn('inline-flex items-center rounded-full bg-violet-50 border border-violet-200 px-2 py-0.5 text-xs font-medium text-violet-700', className)}>
      {LABELS[entityType]}
    </span>
  )
}
