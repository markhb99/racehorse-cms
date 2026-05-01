'use client'

import { useState, useMemo } from 'react'
import { Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusBadge } from './status-badge'
import { formatCurrency } from '@/lib/format/currency'
import type { Buyer } from '@/lib/types'
import type { BuyerStatusKey } from '@/lib/constants'

type SortKey = 'first_name' | 'shares_pct' | 'status' | 'invoice_amount' | 'paid_amount' | 'outstanding'
type SortDir = 'asc' | 'desc'

interface BuyerTableProps {
  buyers: Buyer[]
  selectedIds: Set<string>
  onSelectionChange: (ids: Set<string>) => void
  onEdit: (buyer: Buyer) => void
  onDelete: (buyer: Buyer) => void
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronUp className="h-3 w-3 opacity-30" />
  return dir === 'asc'
    ? <ChevronUp className="h-3 w-3" />
    : <ChevronDown className="h-3 w-3" />
}

export function BuyerTable({ buyers, selectedIds, onSelectionChange, onEdit, onDelete }: BuyerTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('shares_pct')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const sorted = useMemo(() => {
    return [...buyers].sort((a, b) => {
      let av: string | number = 0
      let bv: string | number = 0
      if (sortKey === 'first_name') { av = `${a.first_name} ${a.last_name ?? ''}`; bv = `${b.first_name} ${b.last_name ?? ''}` }
      else if (sortKey === 'outstanding') { av = Number(a.invoice_amount) - Number(a.paid_amount); bv = Number(b.invoice_amount) - Number(b.paid_amount) }
      else { av = Number(a[sortKey as keyof Buyer] ?? 0); bv = Number(b[sortKey as keyof Buyer] ?? 0) }
      const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [buyers, sortKey, sortDir])

  const allSelected = buyers.length > 0 && buyers.every((b) => selectedIds.has(b.id))
  const someSelected = buyers.some((b) => selectedIds.has(b.id))

  const toggleAll = () => {
    if (allSelected) onSelectionChange(new Set())
    else onSelectionChange(new Set(buyers.map((b) => b.id)))
  }
  const toggleRow = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onSelectionChange(next)
  }

  const Th = ({ children, sortable, k, className }: { children: React.ReactNode; sortable?: boolean; k?: SortKey; className?: string }) => (
    <th
      className={cn(
        'px-3 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap',
        sortable && 'cursor-pointer select-none hover:text-foreground',
        className,
      )}
      onClick={sortable && k ? () => toggleSort(k) : undefined}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortable && k && <SortIcon active={sortKey === k} dir={sortDir} />}
      </span>
    </th>
  )

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/30">
          <tr>
            <th className="w-8 px-3 py-2.5">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected }}
                onChange={toggleAll}
                className="rounded border-border"
                aria-label="Select all buyers"
              />
            </th>
            <Th className="w-8">#</Th>
            <Th sortable k="first_name">Full Name</Th>
            <Th sortable k="shares_pct">Shares %</Th>
            <Th sortable k="status">Status</Th>
            <Th sortable k="invoice_amount">Invoice</Th>
            <Th sortable k="paid_amount">Paid</Th>
            <Th sortable k="outstanding">Outstanding</Th>
            <Th>Remarks</Th>
            <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {sorted.length === 0 && (
            <tr>
              <td colSpan={10} className="px-3 py-8 text-center text-sm text-muted-foreground">
                No buyers yet.
              </td>
            </tr>
          )}
          {sorted.map((buyer, idx) => {
            const isSelected = selectedIds.has(buyer.id)
            const outstanding = Number(buyer.invoice_amount) - Number(buyer.paid_amount)
            const status = buyer.status as BuyerStatusKey
            return (
              <tr
                key={buyer.id}
                className={cn(
                  'transition-colors',
                  isSelected && 'bg-accent/40',
                  !isSelected && status === 'completed' && 'bg-emerald-50/40 dark:bg-emerald-950/20',
                  !isSelected && status !== 'completed' && 'hover:bg-muted/30',
                )}
              >
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleRow(buyer.id)}
                    className="rounded border-border"
                    aria-label={`Select ${buyer.first_name}`}
                  />
                </td>
                <td className="px-3 py-2 text-muted-foreground tabular-nums">{idx + 1}</td>
                <td className="px-3 py-2 font-medium whitespace-nowrap">
                  {buyer.first_name} {buyer.last_name ?? ''}
                  {buyer.email && (
                    <span className="block text-xs text-muted-foreground font-normal">{buyer.email}</span>
                  )}
                </td>
                <td className="px-3 py-2 tabular-nums">{Number(buyer.shares_pct).toFixed(1)}%</td>
                <td className="px-3 py-2">
                  <StatusBadge status={status} />
                </td>
                <td className="px-3 py-2 tabular-nums">{formatCurrency(buyer.invoice_amount)}</td>
                <td className="px-3 py-2 tabular-nums">{formatCurrency(buyer.paid_amount)}</td>
                <td className={cn('px-3 py-2 tabular-nums', status === 'not_proceeding' && 'text-muted-foreground line-through')}>
                  {formatCurrency(outstanding)}
                </td>
                <td className="max-w-[140px] truncate px-3 py-2 text-xs text-muted-foreground">
                  {buyer.remarks ?? '—'}
                </td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(buyer)}
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label={`Edit ${buyer.first_name}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(buyer)}
                      className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Delete ${buyer.first_name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
