'use client'

import Link from 'next/link'
import { MoreHorizontal, Pencil, Archive, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { HorseStatusBadge } from './horse-status-badge'
import { SharesProgressBar } from './shares-progress-bar'
import { formatCurrency } from '@/lib/format/currency'
import type { HorseWithStats } from '@/lib/types'

interface HorseCardProps {
  horse: HorseWithStats
  onEdit: (horse: HorseWithStats) => void
  onArchive: (horse: HorseWithStats) => void
  onDelete: (horse: HorseWithStats) => void
}

export function HorseCard({ horse, onEdit, onArchive, onDelete }: HorseCardProps) {
  const { stats } = horse

  return (
    <Card
      className="group overflow-hidden border-l-4 shadow-sm hover:shadow-md transition-shadow"
      style={{ borderLeftColor: horse.color }}
    >
      <CardContent className="pl-4 pt-4 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <Link
              href={`/horses/${horse.id}`}
              className="block truncate font-semibold leading-tight hover:underline"
            >
              {horse.display_name}
            </Link>
            <HorseStatusBadge status={horse.status} className="mt-1" />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Horse actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onSelect={() => onEdit(horse)} className="gap-2">
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onArchive(horse)} className="gap-2">
                <Archive className="h-3.5 w-3.5" />
                {horse.status === 'archived' ? 'Restore' : 'Archive'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => onDelete(horse)}
                variant="destructive"
                className="gap-2"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Shares sold</span>
            <span className="tabular-nums font-mono">{stats.sharesSoldPct.toFixed(1)}%</span>
          </div>
          <SharesProgressBar percent={stats.sharesSoldPct} color={horse.color} />
        </div>

        <div className="mt-3 pt-3 border-t border-border/50 flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Collected</p>
            <p className="text-sm font-semibold tabular-nums font-mono">
              {formatCurrency(stats.collectedTotal)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Buyers</p>
            <p className="text-sm font-semibold">
              {stats.buyerCount}
              {stats.actionRequiredCount > 0 && (
                <span className="ml-1 text-orange-500 text-xs font-normal">
                  · {stats.actionRequiredCount} action
                </span>
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
