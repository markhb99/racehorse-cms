'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, CheckCircle2, AlertCircle, Loader2, ChevronRight, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { parseExcelBuyers } from '@/lib/import/parse-excel-buyers'
import type { ParsedBuyer } from '@/lib/schemas/import'

// ─── Step 1 schema ────────────────────────────────────────────────────────────

const horseSchema = z.object({
  display_name:        z.string().min(1, 'Horse name is required').max(120),
  total_shares:        z.number().int().min(1).max(100).default(100),
  share_price_per_pct: z.number().min(0).default(0),
  color:               z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#2563EB'),
  notes:               z.string().optional(),
})

type HorseFormValues = z.infer<typeof horseSchema>

interface PreviewRow extends ParsedBuyer {
  matchType: 'matched' | 'new'
  matchedName?: string
}

interface ImportResult {
  horseId: string
  insertedBuyers: number
  matchedCustomers: number
  createdCustomers: number
  warnings: string[]
}

const COLORS = ['#2563EB','#16A34A','#DC2626','#9333EA','#EA580C','#0891B2','#CA8A04','#BE185D']

const STEPS = ['Horse Details', 'Upload Buyers', 'Preview', 'Confirm']

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-colors ${
            i < current ? 'bg-primary text-primary-foreground' :
            i === current ? 'bg-primary text-primary-foreground ring-2 ring-primary/30' :
            'bg-muted text-muted-foreground'
          }`}>
            {i < current ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
          </div>
          <span className={`hidden sm:block text-xs ${i === current ? 'font-medium' : 'text-muted-foreground'}`}>
            {label}
          </span>
          {i < STEPS.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />}
        </div>
      ))}
    </div>
  )
}

// ─── Main wizard ──────────────────────────────────────────────────────────────

export function SyndicationWizard() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [horseData, setHorseData] = useState<HorseFormValues | null>(null)
  const [parsedRows, setParsedRows] = useState<ParsedBuyer[]>([])
  const [parseWarnings, setParseWarnings] = useState<string[]>([])
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([])
  const [result, setResult] = useState<ImportResult | null>(null)
  const [isPending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  const horseForm = useForm<HorseFormValues, unknown, HorseFormValues>({
    resolver: zodResolver(horseSchema) as Resolver<HorseFormValues, unknown, HorseFormValues>,
    defaultValues: {
      display_name: '', total_shares: 100, share_price_per_pct: 0, color: '#2563EB', notes: '',
    },
  })

  // ── Step 1: Horse details ────────────────────────────────────────────────────

  const handleHorseSubmit = horseForm.handleSubmit((data) => {
    setHorseData(data as HorseFormValues)
    setStep(1)
  })

  // ── Step 2: File upload ──────────────────────────────────────────────────────

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const buf = await file.arrayBuffer()
    const result = await parseExcelBuyers(buf)
    setParsedRows(result.rows)
    setParseWarnings(result.warnings)

    // Build preview (no real preview endpoint — mark all as new until import)
    setPreviewRows(result.rows.map((r) => ({ ...r, matchType: 'new' })))
    setStep(2)
  }

  // ── Step 4: Submit ───────────────────────────────────────────────────────────

  const handleImport = () => {
    if (!horseData) return
    startTransition(async () => {
      const res = await fetch('/api/import/syndication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ horse: horseData, rows: parsedRows }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? 'Import failed')
        return
      }
      setResult(json)
      setStep(3)
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New Syndication Import</h1>
        <p className="text-sm text-muted-foreground mt-1">Add a new horse and its initial buyers in one operation.</p>
      </div>

      <StepIndicator current={step} />

      {/* Step 0: Horse details */}
      {step === 0 && (
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-medium">Horse Details</h2>
          <Form {...horseForm}>
            <form id="horse-form" onSubmit={handleHorseSubmit} className="space-y-4">
              <FormField control={horseForm.control} name="display_name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Horse Name *</FormLabel>
                  <FormControl><Input placeholder="e.g. Regal Vanguard" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-3">
                <FormField control={horseForm.control} name="total_shares" render={({ field }) => (
                  <FormItem>
                    <FormLabel>% to Sell</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={100} {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                    </FormControl>
                    <FormDescription>Total share % available</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={horseForm.control} name="share_price_per_pct" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per %</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step={0.01} {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={horseForm.control} name="color" render={({ field }) => (
                <FormItem>
                  <FormLabel>Colour</FormLabel>
                  <FormControl>
                    <div className="flex gap-2 flex-wrap">
                      {COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => field.onChange(c)}
                          className={`h-7 w-7 rounded-full border-2 transition-transform ${
                            field.value === c ? 'border-foreground scale-110' : 'border-transparent'
                          }`}
                          style={{ background: c }}
                          aria-label={c}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={horseForm.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <textarea
                      rows={2}
                      className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </form>
          </Form>
          <div className="flex justify-end">
            <Button type="submit" form="horse-form">
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-medium">Upload Buyer List</h2>
          <p className="text-sm text-muted-foreground">
            Upload the .xlsx file for <strong>{horseData?.display_name}</strong>.
            The parser auto-detects columns.
          </p>
          <label className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Click to select .xlsx file</span>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(0)}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === 2 && (
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-medium">Preview — {parsedRows.length} buyers detected</h2>

          {parseWarnings.length > 0 && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 space-y-1">
              {parseWarnings.map((w, i) => <p key={i}>{w}</p>)}
            </div>
          )}

          <div className="overflow-x-auto rounded-lg border text-sm max-h-72 overflow-y-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/30 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Name</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Email</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">%</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Customer</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {previewRows.map((r, i) => (
                  <tr key={i} className="hover:bg-muted/20">
                    <td className="px-3 py-2 whitespace-nowrap">
                      {r.first_name} {r.last_name ?? ''}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{r.email ?? '—'}</td>
                    <td className="px-3 py-2 tabular-nums">{r.shares_pct}%</td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700">
                        New customer will be created
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            <Button onClick={() => setStep(3)} disabled={parsedRows.length === 0}>
              Confirm Import <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm / result */}
      {step === 3 && !result && (
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-medium">Confirm Import</h2>
          <div className="rounded-lg bg-muted/40 p-4 text-sm space-y-1">
            <p><strong>{horseData?.display_name}</strong> will be created</p>
            <p><strong>{parsedRows.length}</strong> buyers will be imported</p>
            <p className="text-muted-foreground">Customer records will be found or created for each buyer.</p>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)} disabled={isPending}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            <Button onClick={handleImport} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Import
            </Button>
          </div>
        </div>
      )}

      {/* Success */}
      {result && (
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
            <h2 className="font-semibold">Import Complete</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="text-muted-foreground text-xs">Buyers imported</p>
              <p className="text-xl font-semibold tabular-nums">{result.insertedBuyers}</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="text-muted-foreground text-xs">New customers created</p>
              <p className="text-xl font-semibold tabular-nums">{result.createdCustomers}</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="text-muted-foreground text-xs">Existing customers matched</p>
              <p className="text-xl font-semibold tabular-nums">{result.matchedCustomers}</p>
            </div>
          </div>
          {result.warnings.length > 0 && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 space-y-1">
              {result.warnings.map((w, i) => (
                <p key={i} className="text-xs text-amber-800 flex gap-1.5">
                  <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />{w}
                </p>
              ))}
            </div>
          )}
          <Button className="w-full" onClick={() => router.push(`/horses/${result.horseId}`)}>
            View Horse →
          </Button>
        </div>
      )}
    </div>
  )
}
