'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { setMarketingConsent } from '@/app/actions/customers'
import { toast } from 'sonner'
import type { Customer } from '@/lib/types'

const CONSENT_SOURCES = ['Manual', 'Web Form', 'Phone', 'Imported with Evidence'] as const

export function MarketingConsentToggle({ customer }: { customer: Customer }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [source, setSource] = useState<string>('Manual')
  const [confirmed, setConfirmed] = useState(false)
  const [pending, startTransition] = useTransition()

  const handleRevoke = () => {
    startTransition(async () => {
      const res = await setMarketingConsent({ id: customer.id, consent: false })
      if (res.ok) toast.success('Marketing consent revoked')
      else toast.error(res.error)
    })
  }

  const handleGrant = () => {
    startTransition(async () => {
      const res = await setMarketingConsent({ id: customer.id, consent: true, source })
      if (res.ok) {
        toast.success('Marketing consent recorded')
        setDialogOpen(false)
        setConfirmed(false)
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <div className="flex items-center gap-3">
      {customer.marketing_consent ? (
        <>
          <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Consented
            {customer.marketing_consent_at && (
              <span className="text-muted-foreground text-xs">
                {new Date(customer.marketing_consent_at).toLocaleDateString('en-AU')}
                {customer.marketing_consent_source && ` via ${customer.marketing_consent_source}`}
              </span>
            )}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={handleRevoke}
            className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
          >
            Revoke
          </Button>
        </>
      ) : (
        <>
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <XCircle className="h-4 w-4" />No consent
          </span>
          <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
            Grant Consent
          </Button>
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Grant Marketing Consent</DialogTitle>
            <DialogDescription>
              Record that {customer.display_name} has given explicit consent to receive
              marketing communications. You must have proof of consent before clicking Confirm.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Consent source</Label>
              <Select value={source} onValueChange={(v) => { if (v) setSource(v) }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONSENT_SOURCES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="consent-confirm"
                checked={confirmed}
                onCheckedChange={(v) => setConfirmed(v === true)}
              />
              <Label htmlFor="consent-confirm" className="text-sm leading-snug cursor-pointer">
                I confirm that {customer.display_name} has explicitly given consent to receive
                marketing communications and I have evidence of this consent.
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleGrant} disabled={!confirmed || pending}>
              Grant Consent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
