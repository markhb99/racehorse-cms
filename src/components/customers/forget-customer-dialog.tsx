'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { forgetCustomer } from '@/app/actions/customers'
import type { Customer } from '@/lib/types'

export function ForgetCustomerDialog({
  customer,
  hasActiveHoldings,
  open,
  onOpenChange,
}: {
  customer: Customer
  hasActiveHoldings: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [step, setStep] = useState<1 | 2>(1)
  const [confirmName, setConfirmName] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleForget = () => {
    startTransition(async () => {
      const result = await forgetCustomer({ id: customer.id, confirmName })
      if (result.ok) {
        toast.success('Customer data erased')
        onOpenChange(false)
        router.push('/customers')
      } else {
        toast.error(result.error)
      }
    })
  }

  const reset = () => {
    setStep(1)
    setConfirmName('')
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Forget Customer
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <>
            <div className="space-y-3 text-sm text-muted-foreground">
                <p>This will permanently erase all personal data for <strong>{customer.display_name}</strong>:</p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Email, phone, and address</li>
                  <li>Date of birth and notes</li>
                  <li>Marketing consent records</li>
                  <li>Communications timeline</li>
                </ul>
                <p>Share holding records are kept for legal traceability.</p>

                {hasActiveHoldings && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-destructive">
                    <strong>Cannot proceed:</strong> This customer has active holdings.
                    Archive all holdings before erasing this customer.
                  </div>
                )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => setStep(2)}
                disabled={hasActiveHoldings}
              >
                Continue
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 2 && (
          <>
            <DialogDescription className="text-sm">
              Type <strong>{customer.display_name}</strong> exactly to confirm.
            </DialogDescription>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-name">Customer name</Label>
              <Input
                id="confirm-name"
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                placeholder={customer.display_name}
                disabled={isPending}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep(1)} disabled={isPending}>Back</Button>
              <Button
                variant="destructive"
                onClick={handleForget}
                disabled={
                  isPending ||
                  confirmName.trim().toLowerCase() !== customer.display_name.trim().toLowerCase()
                }
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Erase Data
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
