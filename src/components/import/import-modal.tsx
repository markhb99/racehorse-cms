'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, AlertTriangle, CheckCircle2, FileSpreadsheet } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { parseExcelBuyers } from '@/lib/import/parse-excel-buyers'
import { BUYER_STATUSES } from '@/lib/constants'
import type { BuyerStatusKey } from '@/lib/constants'
import type { ParsedBuyer } from '@/lib/schemas/import'

type Step = 'idle' | 'parsing' | 'preview' | 'importing' | 'done'

interface ImportResult {
  inserted: number
  updated: number
}

interface ImportModalProps {
  horseId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportModal({ horseId, open, onOpenChange }: ImportModalProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>('idle')
  const [rows, setRows] = useState<ParsedBuyer[]>([])
  const [warnings, setWarnings] = useState<string[]>([])
  const [result, setResult] = useState<ImportResult | null>(null)
  const [isPending, startTransition] = useTransition()

  function reset() {
    setStep('idle')
    setRows([])
    setWarnings([])
    setResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleClose(open: boolean) {
    if (!open) reset()
    onOpenChange(open)
  }

  async function handleFile(file: File) {
    if (!file.name.endsWith('.xlsx')) {
      toast.error('Please select an .xlsx file')
      return
    }
    setStep('parsing')
    try {
      const buffer = await file.arrayBuffer()
      const { rows: parsed, warnings: warns } = await parseExcelBuyers(buffer)
      if (parsed.length === 0) {
        toast.error('No valid buyer rows found in this file')
        setStep('idle')
        return
      }
      setRows(parsed)
      setWarnings(warns)
      setStep('preview')
    } catch (err) {
      toast.error('Failed to parse file — make sure it is a valid .xlsx')
      console.error(err)
      setStep('idle')
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function handleImport() {
    startTransition(async () => {
      setStep('importing')
      try {
        const res = await fetch('/api/import/buyers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ horseId, rows }),
        })
        const data = await res.json()
        if (!data.ok) throw new Error(data.error ?? 'Import failed')
        setResult({ inserted: data.inserted, updated: data.updated })
        setStep('done')
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Import failed')
        setStep('preview')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl" showCloseButton={step !== 'importing'}>
        <DialogHeader>
          <DialogTitle>
            {step === 'idle' || step === 'parsing' ? 'Import Buyers from Excel' :
             step === 'preview' ? `Preview — ${rows.length} buyer${rows.length !== 1 ? 's' : ''} found` :
             step === 'importing' ? 'Importing…' :
             'Import Complete'}
          </DialogTitle>
        </DialogHeader>

        {/* Step: idle / parsing */}
        {(step === 'idle' || step === 'parsing') && (
          <div
            className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-muted-foreground/25 py-14 transition-colors hover:border-muted-foreground/50 cursor-pointer"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            {step === 'parsing' ? (
              <div className="text-sm text-muted-foreground">Parsing file…</div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground/40" />
                <div className="text-center">
                  <p className="text-sm font-medium">Drag and drop an .xlsx file here</p>
                  <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                </div>
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}>
                  <FileSpreadsheet className="mr-1.5 h-4 w-4" />
                  Choose file
                </Button>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={handleInputChange}
            />
          </div>
        )}

        {/* Step: preview */}
        {step === 'preview' && (
          <div className="space-y-3">
            {warnings.length > 0 && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-900 dark:bg-yellow-950">
                <div className="flex items-center gap-2 text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
                </div>
                <ul className="mt-1.5 space-y-0.5 text-xs text-yellow-700 dark:text-yellow-300">
                  {warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            )}

            <div className="max-h-72 overflow-y-auto rounded-lg border text-xs">
              <table className="w-full">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                  <tr>
                    <th className="p-2 text-left font-medium">Name</th>
                    <th className="p-2 text-left font-medium">Shares %</th>
                    <th className="p-2 text-left font-medium">Status</th>
                    <th className="p-2 text-right font-medium">Invoice</th>
                    <th className="p-2 text-right font-medium">Paid</th>
                    <th className="p-2 text-left font-medium">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-t odd:bg-muted/30">
                      <td className="p-2">{row.first_name} {row.last_name ?? ''}</td>
                      <td className="p-2 tabular-nums">{Number(row.shares_pct).toFixed(1)}%</td>
                      <td className="p-2">{BUYER_STATUSES[row.status as BuyerStatusKey]?.label ?? row.status}</td>
                      <td className="p-2 text-right tabular-nums">${Number(row.invoice_amount).toFixed(2)}</td>
                      <td className="p-2 text-right tabular-nums">${Number(row.paid_amount).toFixed(2)}</td>
                      <td className="p-2 max-w-[160px] truncate text-muted-foreground">{row.remarks ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Step: done */}
        {step === 'done' && result && (
          <div className="flex flex-col items-center gap-4 py-8">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <div className="text-center">
              <p className="font-semibold">Import successful</p>
              <p className="text-sm text-muted-foreground mt-1">
                {result.inserted} new buyer{result.inserted !== 1 ? 's' : ''} added
                {result.updated > 0 && `, ${result.updated} updated`}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <DialogFooter>
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={reset}>Back</Button>
              <Button onClick={handleImport} disabled={isPending}>
                Import {rows.length} buyer{rows.length !== 1 ? 's' : ''}
              </Button>
            </>
          )}
          {step === 'done' && (
            <Button onClick={() => handleClose(false)}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
