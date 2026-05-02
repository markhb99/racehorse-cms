'use client'

import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StatusBadge } from './status-badge'
import { formatCurrency } from '@/lib/format/currency'
import type { Buyer } from '@/lib/types'
import type { BuyerStatusKey } from '@/lib/constants'

interface BuyerCardListProps {
  buyers: Buyer[]
  selectedIds: Set<string>
  onSelectionChange: (ids: Set<string>) => void
  onEdit: (buyer: Buyer) => void
  onDelete: (buyer: Buyer) => void
}

export function BuyerCardList({ buyers, selectedIds, onSelectionChange, onEdit, onDelete }: BuyerCardListProps) {
  const toggleRow = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onSelectionChange(next)
  }

  if (buyers.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">No buyers yet.</p>
    )
  }

  return (
    <div className="space-y-3">
      {buyers.map((buyer) => {
        const isSelected = selectedIds.has(buyer.id)
        const outstanding = Number(buyer.invoice_amount) - Number(buyer.paid_amount)
        const status = buyer.status as BuyerStatusKey

        return (
          <Card
            key={buyer.id}
            className={cn(
              'cursor-pointer transition-colors',
              isSelected && 'ring-2 ring-primary',
              status === 'completed' && !isSelected && 'bg-emerald-50/40 dark:bg-emerald-950/20',
            )}
            onClick={() => toggleRow(buyer.id)}
          >
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {buyer.first_name} {buyer.last_name ?? ''}
                  </p>
                  {buyer.email && (
                    <p className="text-xs text-muted-foreground truncate">{buyer.email}</p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <StatusBadge status={status} />

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors -mr-1"
                      aria-label="Buyer actions"
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onSelect={() => onEdit(buyer)} className="gap-2">
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => onDelete(buyer)}
                        variant="destructive"
                        className="gap-2"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Shares</p>
                  <p className="font-medium tabular-nums">{Number(buyer.shares_pct).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Outstanding</p>
                  <p className={cn('font-medium tabular-nums', status === 'not_proceeding' && 'line-through text-muted-foreground')}>
                    {formatCurrency(outstanding)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Paid</p>
                  <p className="font-medium tabular-nums">{formatCurrency(buyer.paid_amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Invoice</p>
                  <p className="font-medium tabular-nums">{formatCurrency(buyer.invoice_amount)}</p>
                </div>
              </div>

              {buyer.remarks && (
                <p className="mt-2 text-xs text-muted-foreground italic line-clamp-2">
                  {buyer.remarks}
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
