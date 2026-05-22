'use client'

import { useState } from 'react'
import { Mail, Phone, Pencil, Trash2, MessageSquarePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CustomerStatusBadge } from './customer-status-badge'
import { EntityTypeBadge } from './entity-type-badge'
import { EditCustomerModal } from './edit-customer-modal'
import { AddCommunicationModal } from './add-communication-modal'
import { ForgetCustomerDialog } from './forget-customer-dialog'
import type { Customer, BuyerWithHorse } from '@/lib/types'
import { TERMINAL_STATUSES } from '@/lib/constants'
import type { BuyerStatusKey } from '@/lib/constants'

export function CustomerDetailHeader({
  customer,
  holdings,
}: {
  customer: Customer
  holdings: BuyerWithHorse[]
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [commOpen, setCommOpen] = useState(false)
  const [forgetOpen, setForgetOpen] = useState(false)

  const hasActiveHoldings = holdings.some(
    (h) => !TERMINAL_STATUSES.includes(h.status as BuyerStatusKey),
  )

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{customer.display_name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <CustomerStatusBadge status={customer.status} />
            <EntityTypeBadge entityType={customer.entity_type} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={() => setCommOpen(true)} className="gap-1.5">
            <MessageSquarePlus className="h-3.5 w-3.5" />
            Log Contact
          </Button>
          <Button size="sm" variant="outline" onClick={() => setEditOpen(true)} className="gap-1.5">
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setForgetOpen(true)}
            className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Forget
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        {customer.email && (
          <a href={`mailto:${customer.email}`} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
            <Mail className="h-3.5 w-3.5" />
            {customer.email}
          </a>
        )}
        {customer.phone && (
          <a href={`tel:${customer.phone}`} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
            <Phone className="h-3.5 w-3.5" />
            {customer.phone}
          </a>
        )}
        {(customer.suburb || customer.state) && (
          <span>
            {[customer.suburb, customer.state, customer.postcode].filter(Boolean).join(', ')}
          </span>
        )}
      </div>

      {customer.tags && customer.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {customer.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {tag}
            </span>
          ))}
        </div>
      )}

      <EditCustomerModal customer={customer} open={editOpen} onOpenChange={setEditOpen} />
      <AddCommunicationModal customerId={customer.id} open={commOpen} onOpenChange={setCommOpen} />
      <ForgetCustomerDialog
        customer={customer}
        hasActiveHoldings={hasActiveHoldings}
        open={forgetOpen}
        onOpenChange={setForgetOpen}
      />
    </div>
  )
}
