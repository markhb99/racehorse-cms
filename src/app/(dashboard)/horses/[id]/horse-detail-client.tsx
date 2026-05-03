'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Upload, Download, FileText, MoreHorizontal, Pencil, Archive, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { KpiCard } from '@/components/kpi/kpi-card'
import { SharesProgressBar } from '@/components/horses/shares-progress-bar'
import { HorseStatusBadge } from '@/components/horses/horse-status-badge'
import { RevenueChart } from '@/components/horses/revenue-chart'
import { EditHorseModal } from '@/components/horses/edit-horse-modal'
import { ArchiveHorseDialog } from '@/components/horses/archive-horse-dialog'
import { DeleteHorseDialog } from '@/components/horses/delete-horse-dialog'
import { StatusPipeline } from '@/components/buyers/status-pipeline'
import { ActionRequiredList } from '@/components/buyers/action-required-list'
import { BuyerTable } from '@/components/buyers/buyer-table'
import { BuyerCardList } from '@/components/buyers/buyer-card-list'
import { BulkActionBar } from '@/components/buyers/bulk-action-bar'
import { AddBuyerModal } from '@/components/buyers/add-buyer-modal'
import { EditBuyerModal } from '@/components/buyers/edit-buyer-modal'
import { DeleteBuyerDialog } from '@/components/buyers/delete-buyer-dialog'
import { ImportModal } from '@/components/import/import-modal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatCurrency } from '@/lib/format/currency'
import { formatPercent } from '@/lib/format/percent'
import { useMediaQuery } from '@/lib/hooks/use-media-query'
import type { HorseWithStats, Buyer } from '@/lib/types'
import type { BuyerStatusKey } from '@/lib/constants'

interface HorseDetailClientProps {
  horse: HorseWithStats
  buyers: Buyer[]
}

export function HorseDetailClient({ horse, buyers }: HorseDetailClientProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  // Horse modals
  const [editHorseOpen, setEditHorseOpen] = useState(false)
  const [archiveHorseOpen, setArchiveHorseOpen] = useState(false)
  const [deleteHorseOpen, setDeleteHorseOpen] = useState(false)

  // Buyer modals
  const [addBuyerOpen, setAddBuyerOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [editBuyer, setEditBuyer] = useState<Buyer | null>(null)
  const [deleteBuyer, setDeleteBuyer] = useState<Buyer | null>(null)

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const { stats } = horse
  const sharesRemaining = Math.max(0, horse.total_shares - stats.sharesSoldPct)
  const totalRevenue = horse.total_shares * Number(horse.share_price_per_pct)
  const unsoldRevenue = Math.max(0, totalRevenue - stats.collectedTotal - stats.outstandingTotal)

  return (
    <>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/horses" className="hover:text-foreground transition-colors">
            Horses
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate">{horse.display_name}</span>
        </nav>

        {/* Header card */}
        <div
          className="relative overflow-hidden rounded-xl border bg-card p-5 pl-7"
          style={{ borderLeftWidth: '6px', borderLeftColor: horse.color }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-semibold tracking-tight">{horse.display_name}</h1>
                <HorseStatusBadge status={horse.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Total shares: {horse.total_shares}%
                {Number(horse.share_price_per_pct) > 0 && (
                  <> · Price/%: {formatCurrency(horse.share_price_per_pct)}</>
                )}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Horse actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onSelect={() => setEditHorseOpen(true)} className="gap-2">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setArchiveHorseOpen(true)} className="gap-2">
                  <Archive className="h-3.5 w-3.5" />
                  {horse.status === 'archived' ? 'Restore' : 'Archive'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setDeleteHorseOpen(true)} variant="destructive" className="gap-2">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <KpiCard label="Shares Sold" value={formatPercent(stats.sharesSoldPct, 1)} />
          <KpiCard label="Shares Left" value={formatPercent(sharesRemaining, 1)} />
          <KpiCard label="Collected" value={formatCurrency(stats.collectedTotal)} />
          <KpiCard label="Outstanding" value={formatCurrency(stats.outstandingTotal)} />
          <KpiCard label="Total Revenue" value={formatCurrency(totalRevenue)} />
          <KpiCard label="Buyers" value={stats.buyerCount} className="col-span-2 sm:col-span-1 lg:col-span-1" />
        </div>

        {/* Revenue chart */}
        <RevenueChart
          collected={stats.collectedTotal}
          outstanding={stats.outstandingTotal}
          unsold={unsoldRevenue}
        />

        {/* Progress + Pipeline */}
        <div className="space-y-3">
          <SharesProgressBar percent={stats.sharesSoldPct} color={horse.color} size="lg" />
          <StatusPipeline counts={stats.statusCounts as Record<BuyerStatusKey, number>} />
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" className="gap-1.5" onClick={() => setAddBuyerOpen(true)}>
            <Plus className="h-4 w-4" /> Add Buyer
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => setImportOpen(true)}
          >
            <Upload className="h-4 w-4" /> Import Excel
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => window.open(`/api/export/excel/${horse.id}`, '_blank')}
          >
            <Download className="h-4 w-4" /> Export Excel
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => window.open(`/api/export/pdf/${horse.id}`, '_blank')}
          >
            <FileText className="h-4 w-4" /> Export PDF
          </Button>
        </div>

        {/* Action required */}
        <ActionRequiredList buyers={buyers} onEdit={setEditBuyer} />

        {/* Buyer list */}
        {isDesktop ? (
          <BuyerTable
            buyers={buyers}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onEdit={setEditBuyer}
            onDelete={setDeleteBuyer}
          />
        ) : (
          <BuyerCardList
            buyers={buyers}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onEdit={setEditBuyer}
            onDelete={setDeleteBuyer}
          />
        )}
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <BulkActionBar selectedIds={selectedIds} onClear={() => setSelectedIds(new Set())} />
      )}

      {/* Horse modals */}
      <EditHorseModal horse={horse} open={editHorseOpen} onOpenChange={setEditHorseOpen} />
      <ArchiveHorseDialog horse={horse} open={archiveHorseOpen} onOpenChange={setArchiveHorseOpen} />
      <DeleteHorseDialog horse={horse} open={deleteHorseOpen} onOpenChange={setDeleteHorseOpen} />

      {/* Import modal */}
      <ImportModal horseId={horse.id} open={importOpen} onOpenChange={setImportOpen} />

      {/* Buyer modals */}
      <AddBuyerModal horseId={horse.id} open={addBuyerOpen} onOpenChange={setAddBuyerOpen} />
      <EditBuyerModal buyer={editBuyer} open={!!editBuyer} onOpenChange={(v) => !v && setEditBuyer(null)} />
      <DeleteBuyerDialog buyer={deleteBuyer} open={!!deleteBuyer} onOpenChange={(v) => !v && setDeleteBuyer(null)} />
    </>
  )
}
