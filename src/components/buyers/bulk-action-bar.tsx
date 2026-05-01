'use client'

import { useState, useTransition } from 'react'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BUYER_STATUSES, type BuyerStatusKey } from '@/lib/constants'
import { bulkUpdateBuyerStatus } from '@/app/actions/buyers'

interface BulkActionBarProps {
  selectedIds: Set<string>
  onClear: () => void
}

export function BulkActionBar({ selectedIds, onClear }: BulkActionBarProps) {
  const [status, setStatus] = useState<BuyerStatusKey>('awaiting_payment')
  const [isPending, startTransition] = useTransition()

  const handleApply = () => {
    startTransition(async () => {
      const result = await bulkUpdateBuyerStatus({
        ids: [...selectedIds],
        status,
      })
      if (result.ok) {
        toast.success(`Updated ${selectedIds.size} buyer${selectedIds.size !== 1 ? 's' : ''}`)
        onClear()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-xl border bg-popover px-4 py-2.5 shadow-lg ring-1 ring-foreground/10">
      <span className="text-sm font-medium tabular-nums whitespace-nowrap">
        {selectedIds.size} selected
      </span>

      <div className="h-4 w-px bg-border" aria-hidden />

      <span className="text-xs text-muted-foreground whitespace-nowrap">Set status:</span>

      <Select value={status} onValueChange={(v) => setStatus(v as BuyerStatusKey)}>
        <SelectTrigger className="h-7 w-44 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.values(BUYER_STATUSES).map((s) => (
            <SelectItem key={s.key} value={s.key}>
              {s.emoji} {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button size="sm" onClick={handleApply} disabled={isPending} className="h-7 text-xs">
        {isPending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
        Apply
      </Button>

      <Button
        size="icon-sm"
        variant="ghost"
        onClick={onClear}
        disabled={isPending}
        aria-label="Clear selection"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
