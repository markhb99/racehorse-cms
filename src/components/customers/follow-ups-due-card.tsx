'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { completeFollowUp } from '@/app/actions/communications'
import { toast } from 'sonner'
import type { CustomerCommunication } from '@/lib/types'

interface FollowUpsDueCardProps {
  overdue: CustomerCommunication[]
  dueThisWeek: CustomerCommunication[]
  customerNames: Map<string, string>
}

function FollowUpRow({
  comm,
  customerName,
  isOverdue,
}: {
  comm: CustomerCommunication
  customerName: string
  isOverdue: boolean
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b last:border-0">
      <div className="min-w-0 flex-1">
        <Link href={`/customers/${comm.customer_id}`} className="text-sm font-medium hover:underline truncate block">
          {customerName}
        </Link>
        {comm.subject && (
          <p className="text-xs text-muted-foreground truncate">{comm.subject}</p>
        )}
        <span className={cn('inline-flex items-center gap-1 text-xs', isOverdue ? 'text-red-600' : 'text-amber-600')}>
          <Clock className="h-3 w-3" />
          {isOverdue ? 'Overdue: ' : ''}
          {new Date(comm.follow_up_at!).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
        </span>
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(async () => {
          const res = await completeFollowUp({ id: comm.id })
          if (!res.ok) toast.error(res.error)
        })}
        className="shrink-0 rounded-full p-1 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
        aria-label="Mark follow-up done"
      >
        <CheckCircle2 className="h-5 w-5" />
      </button>
    </div>
  )
}

export function FollowUpsDueCard({ overdue, dueThisWeek, customerNames }: FollowUpsDueCardProps) {
  if (overdue.length === 0 && dueThisWeek.length === 0) return null

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <AlertCircle className={cn('h-4 w-4', overdue.length > 0 ? 'text-red-500' : 'text-amber-500')} />
        <h3 className="text-sm font-semibold">Follow-ups Due</h3>
        {overdue.length > 0 && (
          <span className="rounded-full bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5">
            {overdue.length} overdue
          </span>
        )}
        {dueThisWeek.length > 0 && (
          <span className="rounded-full bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5">
            {dueThisWeek.length} this week
          </span>
        )}
      </div>

      <div>
        {overdue.map((c) => (
          <FollowUpRow
            key={c.id}
            comm={c}
            customerName={customerNames.get(c.customer_id) ?? 'Unknown'}
            isOverdue
          />
        ))}
        {dueThisWeek.map((c) => (
          <FollowUpRow
            key={c.id}
            comm={c}
            customerName={customerNames.get(c.customer_id) ?? 'Unknown'}
            isOverdue={false}
          />
        ))}
      </div>

      <Link href="/customers" className="block text-xs text-primary hover:underline text-right">
        View all customers →
      </Link>
    </div>
  )
}
