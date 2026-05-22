import type { Database } from './database.types'
import type { BuyerStatusKey } from './constants'

export type Horse = Database['public']['Tables']['horses']['Row']
export type HorseInsert = Database['public']['Tables']['horses']['Insert']
export type HorseUpdate = Database['public']['Tables']['horses']['Update']
export type HorseStatus = Database['public']['Enums']['horse_status']

export type Buyer = Database['public']['Tables']['buyers']['Row']
export type BuyerInsert = Database['public']['Tables']['buyers']['Insert']
export type BuyerUpdate = Database['public']['Tables']['buyers']['Update']
export type BuyerStatus = Database['public']['Enums']['buyer_status']

export type Setting = Database['public']['Tables']['settings']['Row']

export type Customer = Database['public']['Tables']['customers']['Row']
export type CustomerInsert = Database['public']['Tables']['customers']['Insert']
export type CustomerUpdate = Database['public']['Tables']['customers']['Update']
export type CustomerStatus = 'prospect' | 'active' | 'lapsed' | 'archived'
export type CustomerEntityType = 'individual' | 'company' | 'trust' | 'partnership' | 'super_fund'

export type CustomerCommunication = Database['public']['Tables']['customer_communications']['Row']
export type CustomerCommunicationInsert = Database['public']['Tables']['customer_communications']['Insert']
export type CommType = 'call' | 'email' | 'sms' | 'meeting' | 'note' | 'document'
export type CommDirection = 'inbound' | 'outbound' | 'na'

export type AuditLog = Database['public']['Tables']['audit_log']['Row']
export type AuditAction =
  | 'create' | 'update' | 'delete' | 'soft_delete' | 'restore'
  | 'forget' | 'export' | 'view' | 'login' | 'logout'
  | 'consent_granted' | 'consent_revoked' | 'import'
export type AuditEntity =
  | 'horse' | 'buyer' | 'customer' | 'customer_communication'
  | 'setting' | 'user' | 'export' | 'login' | 'logout' | 'import'

export interface CustomerHoldingsSummary {
  totalSharesPct: number
  horseCount: number
  lifetimeInvoiced: number
  lifetimePaid: number
  lifetimeOutstanding: number
}

export type BuyerWithHorse = Buyer & { horse: Pick<Horse, 'id' | 'display_name' | 'color' | 'status'> }

export interface CustomerWithSummary extends Customer {
  totalSharesPct: number
  horseCount: number
  lifetimePaid: number
  lifetimeInvoiced: number
  lifetimeOutstanding: number
  lastContactedAt: string | null
}

export interface CustomerProfile extends Customer {
  holdings: BuyerWithHorse[]
  communications: CustomerCommunication[]
}

export interface RankedCustomer extends CustomerWithSummary {
  rank: number
}

export interface HorseStats {
  buyerCount: number
  sharesSoldPct: number
  invoicedTotal: number
  collectedTotal: number
  outstandingTotal: number
  actionRequiredCount: number
  statusCounts: Record<BuyerStatusKey, number>
}

export type HorseWithStats = Horse & { stats: HorseStats }

export interface GlobalKpis {
  revenueCollected: number
  revenueInvoiced: number
  sharesSoldWeightedPct: number
  activeBuyerCount: number
  perHorse: Record<string, HorseStats>
}
