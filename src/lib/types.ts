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
