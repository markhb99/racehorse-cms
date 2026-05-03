'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Plus, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/feedback/empty-state'
import { HorseGrid } from '@/components/horses/horse-grid'
import { AddHorseModal } from '@/components/horses/add-horse-modal'
import { EditHorseModal } from '@/components/horses/edit-horse-modal'
import { ArchiveHorseDialog } from '@/components/horses/archive-horse-dialog'
import { DeleteHorseDialog } from '@/components/horses/delete-horse-dialog'
import type { HorseWithStats, Horse } from '@/lib/types'
import { cn } from '@/lib/utils'

type StatusFilter = 'active' | 'sold' | 'archived' | 'all'

const FILTERS: { label: string; value: StatusFilter }[] = [
  { label: 'Active', value: 'active' },
  { label: 'Sold', value: 'sold' },
  { label: 'Archived', value: 'archived' },
]

interface HorsesPageClientProps {
  horses: HorseWithStats[]
  status: StatusFilter
}

export function HorsesPageClient({ horses, status }: HorsesPageClientProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [addOpen, setAddOpen] = useState(false)
  const [editHorse, setEditHorse] = useState<Horse | null>(null)
  const [archiveHorse, setArchiveHorse] = useState<Horse | null>(null)
  const [deleteHorse, setDeleteHorse] = useState<Horse | null>(null)

  const setFilter = (value: StatusFilter) => {
    const params = new URLSearchParams()
    if (value !== 'active') params.set('status', value)
    const qs = params.toString()
    router.push(`${pathname}${qs ? `?${qs}` : ''}`)
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Horses</h1>
          <Button onClick={() => setAddOpen(true)} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Horse
          </Button>
        </div>

        <div className="flex gap-1 rounded-lg border border-border bg-muted/50 p-1 w-fit">
          {FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                status === value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {horses.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title={`No ${status === 'all' ? '' : status} horses`}
            description={
              status === 'active'
                ? 'Add your first horse to start tracking share sales.'
                : `No horses with status "${status}".`
            }
            action={status === 'active' ? { label: 'Add Horse', onClick: () => setAddOpen(true) } : undefined}
          />
        ) : (
          <HorseGrid
            horses={horses}
            onEdit={(h) => setEditHorse(h)}
            onArchive={(h) => setArchiveHorse(h)}
            onDelete={(h) => setDeleteHorse(h)}
          />
        )}
      </div>

      <AddHorseModal open={addOpen} onOpenChange={setAddOpen} />
      <EditHorseModal horse={editHorse} open={!!editHorse} onOpenChange={(v) => !v && setEditHorse(null)} />
      <ArchiveHorseDialog horse={archiveHorse} open={!!archiveHorse} onOpenChange={(v) => !v && setArchiveHorse(null)} />
      <DeleteHorseDialog horse={deleteHorse} open={!!deleteHorse} onOpenChange={(v) => !v && setDeleteHorse(null)} />
    </>
  )
}
