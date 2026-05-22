'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Pencil, Archive, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CustomerStatusBadge } from './customer-status-badge'
import { EntityTypeBadge } from './entity-type-badge'
import { StaleIndicator } from './stale-indicator'
import { formatCurrency } from '@/lib/format/currency'
import type { CustomerWithSummary } from '@/lib/types'

interface CustomerCardListProps {
  customers: CustomerWithSummary[]
  onEdit: (c: CustomerWithSummary) => void
  onArchive: (c: CustomerWithSummary) => void
  onDelete: (c: CustomerWithSummary) => void
}

export function CustomerCardList({ customers, onEdit, onArchive, onDelete }: CustomerCardListProps) {
  const router = useRouter()
  if (customers.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">No customers found.</p>
    )
  }

  return (
    <div className="space-y-3">
      {customers.map((c) => (
        <Card key={c.id}>
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <Link href={`/customers/${c.id}`} className="font-medium hover:underline line-clamp-1">
                  {c.display_name}
                </Link>
                <div className="mt-0.5 flex flex-wrap gap-1">
                  <CustomerStatusBadge status={c.status} />
                  <EntityTypeBadge entityType={c.entity_type} />
                </div>
                {c.email && (
                  <p className="mt-1 text-xs text-muted-foreground truncate">{c.email}</p>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors -mr-1 shrink-0"
                  aria-label={`Actions for ${c.display_name}`}
                >
                  <MoreHorizontal className="h-5 w-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onSelect={() => router.push(`/customers/${c.id}`)}>
                    View profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onEdit(c)} className="gap-2">
                    <Pencil className="h-3.5 w-3.5" />Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => onArchive(c)} className="gap-2">
                    <Archive className="h-3.5 w-3.5" />Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onDelete(c)} variant="destructive" className="gap-2">
                    <Trash2 className="h-3.5 w-3.5" />Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-2 grid grid-cols-3 gap-x-3 gap-y-1 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Horses</p>
                <p className="font-medium tabular-nums">{c.horseCount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total %</p>
                <p className="font-medium tabular-nums">{c.totalSharesPct.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Paid</p>
                <p className="font-medium tabular-nums">{formatCurrency(c.lifetimePaid)}</p>
              </div>
            </div>

            <div className="mt-2">
              <StaleIndicator lastContactedAt={c.lastContactedAt} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
