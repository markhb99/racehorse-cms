'use client'

import { useTransition, useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/format/currency'
import { BUYER_STATUSES } from '@/lib/constants'
import { updateBuyerSchema } from '@/lib/schemas/buyer'
import { updateBuyer } from '@/app/actions/buyers'
import type { Buyer } from '@/lib/types'

type BuyerEditValues = z.input<typeof updateBuyerSchema>

interface EditBuyerModalProps {
  buyer: Buyer | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditBuyerModal({ buyer, open, onOpenChange }: EditBuyerModalProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<BuyerEditValues>({
    resolver: zodResolver(updateBuyerSchema),
    defaultValues: {},
  })

  useEffect(() => {
    if (buyer) {
      form.reset({
        first_name: buyer.first_name,
        last_name: buyer.last_name ?? '',
        email: buyer.email ?? '',
        phone: buyer.phone ?? '',
        shares_pct: Number(buyer.shares_pct),
        status: buyer.status as BuyerEditValues['status'],
        invoice_amount: Number(buyer.invoice_amount),
        paid_amount: Number(buyer.paid_amount),
        remarks: buyer.remarks ?? '',
      })
    }
  }, [buyer, form])

  const invoiceAmt = useWatch({ control: form.control, name: 'invoice_amount' })
  const paidAmt = useWatch({ control: form.control, name: 'paid_amount' })
  const outstanding = Math.max(0, Number(invoiceAmt ?? 0) - Number(paidAmt ?? 0))

  const onSubmit = form.handleSubmit((data) => {
    if (!buyer) return
    startTransition(async () => {
      const result = await updateBuyer({ id: buyer.id, horse_id: buyer.horse_id, ...data })
      if (result.ok) {
        toast.success('Buyer updated')
        onOpenChange(false)
      } else {
        toast.error(result.error)
      }
    })
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Buyer</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form id="edit-buyer-form" onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input disabled={isPending} {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" disabled={isPending} {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input disabled={isPending} {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="shares_pct"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shares % *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0.01}
                        max={100}
                        step={0.01}
                        disabled={isPending}
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(BUYER_STATUSES).map((s) => (
                          <SelectItem key={s.key} value={s.key}>
                            {s.emoji} {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="invoice_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        disabled={isPending}
                        {...field}
                        value={field.value ?? 0}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paid_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paid</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        disabled={isPending}
                        {...field}
                        value={field.value ?? 0}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground pt-0.5">Outstanding</p>
                <div className="flex h-8 items-center rounded-lg border border-input bg-muted/30 px-2.5 text-sm tabular-nums">
                  {formatCurrency(outstanding)}
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <textarea
                      rows={2}
                      disabled={isPending}
                      className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50 resize-none"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" form="edit-buyer-form" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
