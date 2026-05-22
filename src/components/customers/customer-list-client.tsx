'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, Plus, UserX } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CustomerTable } from './customer-table'
import { CustomerCardList } from './customer-card-list'
import { AddCustomerModal } from './add-customer-modal'
import { EditCustomerModal } from './edit-customer-modal'
import { archiveCustomer } from '@/app/actions/customers'
import { toast } from 'sonner'
import type { CustomerWithSummary } from '@/lib/types'
import { cn } from '@/lib/utils'

const STATUS_OPTS = [
  { label: 'All', value: 'all' },
  { label: 'Prospect', value: 'prospect' },
  { label: 'Active', value: 'active' },
  { label: 'Lapsed', value: 'lapsed' },
  { label: 'Archived', value: 'archived' },
]

interface CustomerListClientProps {
  customers: CustomerWithSummary[]
  initialSearch: string
  initialStatus: string
}

export function CustomerListClient({ customers, initialSearch, initialStatus }: CustomerListClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [addOpen, setAddOpen] = useState(false)
  const [editCustomer, setEditCustomer] = useState<CustomerWithSummary | null>(null)
  const [searchValue, setSearchValue] = useState(initialSearch)
  const [, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pushParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v)
      else params.delete(k)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleSearchChange = (v: string) => {
    setSearchValue(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      startTransition(() => pushParams({ q: v, page: '' }))
    }, 250)
  }

  const handleArchive = async (c: CustomerWithSummary) => {
    const res = await archiveCustomer({ id: c.id })
    if (res.ok) toast.success('Customer archived')
    else toast.error(res.error)
  }

  const activeStatus = initialStatus || 'all'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
        <Button onClick={() => setAddOpen(true)} className="gap-1.5 shrink-0">
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search by name, email, or phone…"
          className="pl-9"
        />
      </div>

      {/* Status filter rail */}
      <div className="flex gap-1.5 flex-wrap">
        {STATUS_OPTS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => pushParams({ status: opt.value === 'all' ? '' : opt.value, page: '' })}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              activeStatus === opt.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground hover:text-foreground',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Table (desktop) / Cards (mobile) */}
      <div className="hidden md:block">
        <CustomerTable
          customers={customers}
          onEdit={setEditCustomer}
          onArchive={handleArchive}
          onDelete={(c) => setEditCustomer(c)}
        />
      </div>
      <div className="md:hidden">
        <CustomerCardList
          customers={customers}
          onEdit={setEditCustomer}
          onArchive={handleArchive}
          onDelete={(c) => setEditCustomer(c)}
        />
      </div>

      {customers.length === 0 && (
        <div className="py-12 flex flex-col items-center gap-2 text-muted-foreground">
          <UserX className="h-8 w-8" />
          <p className="text-sm">No customers yet. Add one to get started.</p>
        </div>
      )}

      <AddCustomerModal open={addOpen} onOpenChange={setAddOpen} />
      {editCustomer && (
        <EditCustomerModal
          customer={editCustomer}
          open={!!editCustomer}
          onOpenChange={(v) => { if (!v) setEditCustomer(null) }}
        />
      )}
    </div>
  )
}
