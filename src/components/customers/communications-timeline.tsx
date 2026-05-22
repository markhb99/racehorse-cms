'use client'

import { useState, useTransition } from 'react'
import { Phone, Mail, MessageSquare, Users, FileText, File, ArrowDown, ArrowUp, Minus, CheckCircle2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { completeFollowUp } from '@/app/actions/communications'
import { toast } from 'sonner'
import type { CustomerCommunication } from '@/lib/types'

const TYPE_ICON: Record<string, React.ElementType> = {
  call:     Phone,
  email:    Mail,
  sms:      MessageSquare,
  meeting:  Users,
  note:     FileText,
  document: File,
}

const TYPE_LABEL: Record<string, string> = {
  call: 'Call', email: 'Email', sms: 'SMS',
  meeting: 'Meeting', note: 'Note', document: 'Document',
}

function DirectionIcon({ direction }: { direction: string }) {
  if (direction === 'inbound') return <ArrowDown className="h-3 w-3 text-blue-500" />
  if (direction === 'outbound') return <ArrowUp className="h-3 w-3 text-emerald-500" />
  return <Minus className="h-3 w-3 text-muted-foreground" />
}

function FollowUpChip({ comm, onComplete }: { comm: CustomerCommunication; onComplete: () => void }) {
  const [pending, startTransition] = useTransition()
  if (!comm.follow_up_at) return null

  const isCompleted = !!comm.follow_up_completed_at
  const isOverdue = !isCompleted && new Date(comm.follow_up_at) < new Date()

  if (isCompleted) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
        Follow-up done
      </span>
    )
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(async () => {
        const res = await completeFollowUp({ id: comm.id })
        if (res.ok) toast.success('Follow-up marked done')
        else toast.error(res.error)
        onComplete()
      })}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors',
        isOverdue
          ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
          : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100',
      )}
    >
      <Clock className="h-3 w-3" />
      {isOverdue ? 'Overdue: ' : 'Follow-up: '}
      {new Date(comm.follow_up_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
    </button>
  )
}

export function CommunicationsTimeline({
  communications,
  onRefresh,
}: {
  communications: CustomerCommunication[]
  onRefresh: () => void
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (communications.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No communications logged yet.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {communications.map((c) => {
        const Icon = TYPE_ICON[c.type] ?? FileText
        const isExpanded = expanded.has(c.id)

        return (
          <div key={c.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="mt-1 w-px flex-1 bg-border" />
            </div>

            <div className="min-w-0 flex-1 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">{TYPE_LABEL[c.type]}</span>
                <DirectionIcon direction={c.direction} />
                <span className="text-xs text-muted-foreground">
                  {new Date(c.occurred_at).toLocaleDateString('en-AU', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </span>
                <FollowUpChip comm={c} onComplete={onRefresh} />
              </div>

              {c.subject && (
                <p className="mt-0.5 text-sm font-medium">{c.subject}</p>
              )}

              {c.body && (
                <div>
                  <p className={cn('mt-1 text-sm text-muted-foreground', !isExpanded && 'line-clamp-2')}>
                    {c.body}
                  </p>
                  {c.body.length > 120 && (
                    <button
                      type="button"
                      onClick={() => toggle(c.id)}
                      className="mt-0.5 text-xs text-primary hover:underline"
                    >
                      {isExpanded ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
