'use client'

import Link from 'next/link'
import { MoreHorizontal, Pencil, Archive, Trash2 } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CustomerStatusBadge } from './customer-status-badge'
import { EntityTypeBadge } from './entity-type-badge'
import { StaleIndicator } from './stale-indicator'
import { formatCurrency } from '@/lib/format/currency'
import type { CustomerWithSummary } from '@/lib/types'

interface CustomerTableProps {
  customers: CustomerWithSummary[]
  onEdit: (c: CustomerWithSummary) => void
  onArchive: (c: CustomerWithSummary) => void
  onDelete: (c: CustomerWithSummary) => void
}

export function CustomerTable({ customers, onEdit, onArchive, onDelete }: CustomerTableProps) {
  if (customers.length === 0) {
    return (
      <div className="rounded-xl border">
        <p className="py-12 text-center text-sm text-muted-foreground">
          No customers found.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/30">
          <tr>
            <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Name</th>
            <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Horses</th>
            <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Total %</th>
            <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Paid</th>
            <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Status</th>
            <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Last Contact</th>
            <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {customers.map((c) => (
            <tr key={c.id} className="hover:bg-muted/30 transition-colors">
              <td className="px-3 py-2.5 font-medium">
                <Link href={`/customers/${c.id}`} className="hover:underline">
                  {c.display_name}
                </Link>
                <EntityTypeBadge entityType={c.entity_type} className="ml-1.5" />
                {c.email && (
                  <span className="block text-xs text-muted-foreground font-normal">{c.email}</span>
                )}
              </td>
              <td className="px-3 py-2.5 tabular-nums text-muted-foreground">{c.horseCount}</td>
              <td className="px-3 py-2.5 tabular-nums">{c.totalSharesPct.toFixed(1)}%</td>
              <td className="px-3 py-2.5 tabular-nums">{formatCurrency(c.lifetimePaid)}</td>
              <td className="px-3 py-2.5">
                <CustomerStatusBadge status={c.status} />
              </td>
              <td className="px-3 py-2.5">
                <StaleIndicator lastContactedAt={c.lastContactedAt} />
                {c.lastContactedAt && (
                  <span className="text-xs text-muted-foreground">
                    {new Date(c.lastContactedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
              </td>
              <td className="px-3 py-2.5">
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      aria-label={`Actions for ${c.display_name}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem asChild>
                        <Link href={`/customers/${c.id}`}>View profile</Link>
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
