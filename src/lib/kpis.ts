import type { Buyer, Horse, HorseStats, GlobalKpis } from './types'
import { BUYER_STATUS_KEYS, TERMINAL_STATUSES, type BuyerStatusKey } from './constants'

export function computeHorseStats(buyers: Buyer[]): HorseStats {
  const activeBuyers = buyers.filter((b) => b.status !== 'not_proceeding')

  const sharesSoldPct = activeBuyers.reduce((sum, b) => sum + Number(b.shares_pct), 0)
  const invoicedTotal = activeBuyers.reduce((sum, b) => sum + Number(b.invoice_amount), 0)
  const collectedTotal = activeBuyers.reduce((sum, b) => sum + Number(b.paid_amount), 0)
  const outstandingTotal = invoicedTotal - collectedTotal

  const actionRequiredCount = buyers.filter(
    (b) => !TERMINAL_STATUSES.includes(b.status as BuyerStatusKey),
  ).length

  const statusCounts = Object.fromEntries(
    BUYER_STATUS_KEYS.map((k) => [k, buyers.filter((b) => b.status === k).length]),
  ) as Record<BuyerStatusKey, number>

  return {
    buyerCount: buyers.length,
    sharesSoldPct: Math.round(sharesSoldPct * 100) / 100,
    invoicedTotal: Math.round(invoicedTotal * 100) / 100,
    collectedTotal: Math.round(collectedTotal * 100) / 100,
    outstandingTotal: Math.round(outstandingTotal * 100) / 100,
    actionRequiredCount,
    statusCounts,
  }
}

export function computeStatusPipelineCounts(
  buyers: Buyer[],
): Record<BuyerStatusKey, number> {
  return Object.fromEntries(
    BUYER_STATUS_KEYS.map((k) => [k, buyers.filter((b) => b.status === k).length]),
  ) as Record<BuyerStatusKey, number>
}

export function computeGlobalKpis(
  horses: Horse[],
  buyersByHorse: Map<string, Buyer[]>,
): GlobalKpis {
  let revenueCollected = 0
  let revenueInvoiced = 0
  let activeBuyerCount = 0
  let weightedSharesNumerator = 0
  let totalSharesDenominator = 0
  const perHorse: Record<string, HorseStats> = {}

  for (const horse of horses) {
    const buyers = buyersByHorse.get(horse.id) ?? []
    const stats = computeHorseStats(buyers)
    perHorse[horse.id] = stats

    revenueCollected += stats.collectedTotal
    revenueInvoiced += stats.invoicedTotal
    activeBuyerCount += buyers.filter((b) => b.status !== 'not_proceeding').length
    weightedSharesNumerator += stats.sharesSoldPct * horse.total_shares
    totalSharesDenominator += horse.total_shares
  }

  const sharesSoldWeightedPct =
    totalSharesDenominator > 0
      ? Math.round((weightedSharesNumerator / totalSharesDenominator) * 100) / 100
      : 0

  return {
    revenueCollected: Math.round(revenueCollected * 100) / 100,
    revenueInvoiced: Math.round(revenueInvoiced * 100) / 100,
    sharesSoldWeightedPct,
    activeBuyerCount,
    perHorse,
  }
}

export interface DataHealthIssue {
  severity: 'error' | 'warn' | 'info'
  horseId?: string
  horseName?: string
  buyerId?: string
  buyerName?: string
  message: string
}

export function computeDataHealth(
  horses: Horse[],
  buyersByHorse: Map<string, Buyer[]>,
): DataHealthIssue[] {
  const issues: DataHealthIssue[] = []

  for (const horse of horses) {
    const buyers = buyersByHorse.get(horse.id) ?? []

    if (buyers.length === 0) {
      issues.push({
        severity: 'warn',
        horseId: horse.id,
        horseName: horse.display_name,
        message: `"${horse.display_name}" has no buyers yet`,
      })
    }

    const totalShares = buyers
      .filter((b) => b.status !== 'not_proceeding')
      .reduce((sum, b) => sum + Number(b.shares_pct), 0)

    if (totalShares > horse.total_shares + 0.01) {
      issues.push({
        severity: 'error',
        horseId: horse.id,
        horseName: horse.display_name,
        message: `"${horse.display_name}" has ${totalShares.toFixed(2)}% allocated, exceeding 100%`,
      })
    }

    for (const buyer of buyers) {
      if (Number(buyer.paid_amount) > Number(buyer.invoice_amount) + 0.01) {
        issues.push({
          severity: 'warn',
          horseId: horse.id,
          buyerId: buyer.id,
          buyerName: `${buyer.first_name} ${buyer.last_name ?? ''}`.trim(),
          message: `Buyer "${buyer.first_name}" paid more than invoiced on "${horse.display_name}"`,
        })
      }

      if (!buyer.email && !buyer.phone) {
        issues.push({
          severity: 'info',
          horseId: horse.id,
          buyerId: buyer.id,
          buyerName: `${buyer.first_name} ${buyer.last_name ?? ''}`.trim(),
          message: `Buyer "${buyer.first_name}" has no email or phone`,
        })
      }
    }
  }

  return issues
}
