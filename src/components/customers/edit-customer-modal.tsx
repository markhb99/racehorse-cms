'use client'

import { useEffect, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { TagsInput } from './tags-input'
import { updateCustomer } from '@/app/actions/customers'
import type { Customer } from '@/lib/types'

const schema = z.object({
  legal_first_name: z.string().min(1).max(80),
  legal_last_name:  z.string().max(80).optional(),
  display_name:     z.string().min(1).max(160),
  entity_type:      z.enum(['individual', 'company', 'trust', 'partnership', 'super_fund']),
  email:            z.string().email().optional().or(z.literal('')),
  phone:            z.string().max(40).optional(),
  address_line1:    z.string().max(120).optional(),
  suburb:           z.string().max(80).optional(),
  state:            z.string().max(40).optional(),
  postcode:         z.string().regex(/^[0-9]{4}$/).optional().or(z.literal('')),
  status:           z.enum(['prospect', 'active', 'lapsed', 'archived']),
  notes:            z.string().optional(),
  tags:             z.array(z.string()).default([]),
})

type FormValues = z.infer<typeof schema>

export function EditCustomerModal({
  customer,
  open,
  onOpenChange,
}: {
  customer: Customer
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<FormValues, unknown, FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues, unknown, FormValues>,
    defaultValues: {
      legal_first_name: customer.legal_first_name,
      legal_last_name:  customer.legal_last_name ?? '',
      display_name:     customer.display_name,
      entity_type:      customer.entity_type,
      email:            customer.email ?? '',
      phone:            customer.phone ?? '',
      address_line1:    customer.address_line1 ?? '',
      suburb:           customer.suburb ?? '',
      state:            customer.state ?? '',
      postcode:         customer.postcode ?? '',
      status:           customer.status,
      notes:            customer.notes ?? '',
      tags:             customer.tags ?? [],
    },
  })

  useEffect(() => {
    form.reset({
      legal_first_name: customer.legal_first_name,
      legal_last_name:  customer.legal_last_name ?? '',
      display_name:     customer.display_name,
      entity_type:      customer.entity_type,
      email:            customer.email ?? '',
      phone:            customer.phone ?? '',
      address_line1:    customer.address_line1 ?? '',
      suburb:           customer.suburb ?? '',
      state:            customer.state ?? '',
      postcode:         customer.postcode ?? '',
      status:           customer.status,
      notes:            customer.notes ?? '',
      tags:             customer.tags ?? [],
    })
  }, [customer, form])

  const onSubmit = form.handleSubmit((data) => {
    startTransition(async () => {
      const result = await updateCustomer({ id: customer.id, ...data })
      if (result.ok) {
        toast.success('Customer updated')
        onOpenChange(false)
      } else {
        toast.error(result.error)
        if (result.field) form.setError(result.field as keyof FormValues, { message: result.error })
      }
    })
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form id="edit-customer-form" onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="legal_first_name" render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name *</FormLabel>
                  <FormControl><Input disabled={isPending} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="legal_last_name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl><Input disabled={isPending} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="display_name" render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name *</FormLabel>
                <FormControl><Input disabled={isPending} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="entity_type" render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger className="w-full"><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="trust">Trust</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="super_fund">Super Fund</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" disabled={isPending} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl><Input type="tel" disabled={isPending} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="address_line1" render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl><Input disabled={isPending} placeholder="Street address" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-3 gap-3">
              <FormField control={form.control} name="suburb" render={({ field }) => (
                <FormItem>
                  <FormLabel>Suburb</FormLabel>
                  <FormControl><Input disabled={isPending} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="state" render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl><Input disabled={isPending} placeholder="NSW" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="postcode" render={({ field }) => (
                <FormItem>
                  <FormLabel>Postcode</FormLabel>
                  <FormControl><Input disabled={isPending} placeholder="2000" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger className="w-full"><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="lapsed">Lapsed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="tags" render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <TagsInput value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="notes" render={({ field }) => (
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
            )} />
          </form>
        </Form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
          <Button type="submit" form="edit-customer-form" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
