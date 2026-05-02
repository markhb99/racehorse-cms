'use client'

import { useTransition, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
  FormDescription,
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
import { HorseColorPicker } from './horse-color-picker'
import { z } from 'zod'
import { updateHorseSchema } from '@/lib/schemas/horse'
import { updateHorse } from '@/app/actions/horses'
import type { Horse } from '@/lib/types'

type HorseEditValues = z.input<typeof updateHorseSchema>

interface EditHorseModalProps {
  horse: Horse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditHorseModal({ horse, open, onOpenChange }: EditHorseModalProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<HorseEditValues>({
    resolver: zodResolver(updateHorseSchema),
    defaultValues: {
      display_name: '',
      total_shares: 100,
      share_price_per_pct: 0,
      color: '#2563EB',
      status: 'active',
      notes: '',
    },
  })

  useEffect(() => {
    if (horse) {
      form.reset({
        display_name: horse.display_name,
        total_shares: horse.total_shares,
        share_price_per_pct: Number(horse.share_price_per_pct),
        color: horse.color,
        status: horse.status,
        notes: horse.notes ?? '',
      })
    }
  }, [horse, form])

  const onSubmit = form.handleSubmit((data) => {
    if (!horse) return
    startTransition(async () => {
      const result = await updateHorse({ id: horse.id, ...data })
      if (result.ok) {
        toast.success('Horse updated')
        onOpenChange(false)
      } else {
        toast.error(result.error)
      }
    })
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Horse</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form id="edit-horse-form" onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="display_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="total_shares"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>% to Sell</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        disabled={isPending}
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormDescription>How much of this horse you need to sell (e.g. 50 if you only own half)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="share_price_per_pct"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per %</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        disabled={isPending}
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Colour</FormLabel>
                  <FormControl>
                    <HorseColorPicker value={field.value ?? '#2563EB'} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <textarea
                      rows={3}
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
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" form="edit-horse-form" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
