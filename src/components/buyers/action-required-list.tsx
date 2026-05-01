'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusBadge } from './status-badge'
import { formatCurrency } from '@/lib/format/currency'
import { NON_TERMINAL_STATUSES } from '@/lib/constants'
import type { Buyer } from '@/lib/types'

interface ActionRequiredListProps {
  buyers: Buyer[]
  onEdit: (buyer: Buyer) => void
  className?: string
}

export function ActionRequiredList({ buyers, onEdit, className }: ActionRequiredListProps) {
  const [open, setOpen] = useState(true)

  const actionBuyers = buyers.filter((b) =>
    NON_TERMINAL_STATUSES.includes(b.status as typeof NON_TERMINAL_STATUSES[number]),
  )

  if (actionBuyers.length === 0) return null

  return (
    <div className={cn('rounded-xl border bg-card', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span className="font-medium text-sm">
          Action required
          <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-100 px-1.5 text-xs font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
            {actionBuyers.length}
          </span>
        </span>
        {open ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="divide-y border-t">
          {actionBuyers.map((buyer) => {
            const outstanding = Number(buyer.invoice_amount) - Number(buyer.paid_amount)
            return (
              <div
                key={buyer.id}
                className="flex items-center justify-between gap-3 px-4 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {buyer.first_name} {buyer.last_name ?? ''}
                  </p>
                  <StatusBadge status={buyer.status as Parameters<typeof StatusBadge>[0]['status']} className="mt-0.5" />
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {outstanding > 0.01 && (
                    <span className="text-sm tabular-nums text-orange-600 dark:text-orange-400">
                      {formatCurrency(outstanding)}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onEdit(buyer)}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
