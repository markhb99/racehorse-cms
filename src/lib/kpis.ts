import type { Buyer, Horse, HorseStats, GlobalKpis } from './types'
import { BUYER_STATUS_KEYS, TERMINAL_STATUSES, type BuyerStatusKey } from './constants'

export type AnalyticsRange = 'all' | '30d' | '90d'

export interface SharesByStatusRow {
  horseId: string
  horseName: string
  color: string
  completed: number
  awaiting_payment: number
  awaiting_docs: number
  awaiting_form: number
  pending: number
  not_proceeding: number
}

export interface AnalyticsData {
  sharesByStatusByHorse: SharesByStatusRow[]
  revenuePipeline: { collected: number; outstanding: number }
  rankedHoldings: Array<{ name: string; horseName: string; sharesPct: number }>
  summary: {
    largestHolder: string
    avgShareSize: number
    mostCommonStatus: BuyerStatusKey
    newestBuyer: string
  } | null
}

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

export function computeAnalytics(
  horses: Horse[],
  buyersByHorse: Map<string, Buyer[]>,
  range: AnalyticsRange,
): AnalyticsData {
  const cutoff =
    range === '30d' ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    : range === '90d' ? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    : null

  const filtered = new Map<string, Buyer[]>()
  for (const horse of horses) {
    const buyers = buyersByHorse.get(horse.id) ?? []
    filtered.set(horse.id, cutoff ? buyers.filter((b) => new Date(b.created_at) >= cutoff) : buyers)
  }

  // shares by status per horse
  const sharesByStatusByHorse: SharesByStatusRow[] = horses
    .filter((h) => (filtered.get(h.id) ?? []).length > 0)
    .map((horse) => {
      const buyers = filtered.get(horse.id) ?? []
      const row: SharesByStatusRow = {
        horseId: horse.id,
        horseName: horse.display_name,
        color: horse.color,
        completed: 0, awaiting_payment: 0, awaiting_docs: 0,
        awaiting_form: 0, pending: 0, not_proceeding: 0,
      }
      for (const b of buyers) row[b.status as BuyerStatusKey] += Number(b.shares_pct)
      return row
    })

  // revenue pipeline
  let collected = 0; let outstanding = 0
  for (const horse of horses) {
    for (const b of filtered.get(horse.id) ?? []) {
      if (b.status !== 'not_proceeding') {
        collected += Number(b.paid_amount)
        outstanding += Math.max(0, Number(b.invoice_amount) - Number(b.paid_amount))
      }
    }
  }

  // ranked holdings
  const holdings: AnalyticsData['rankedHoldings'] = []
  for (const horse of horses) {
    for (const b of filtered.get(horse.id) ?? []) {
      if (b.status !== 'not_proceeding') {
        holdings.push({
          name: `${b.first_name} ${b.last_name ?? ''}`.trim(),
          horseName: horse.display_name,
          sharesPct: Number(b.shares_pct),
        })
      }
    }
  }
  holdings.sort((a, b) => b.sharesPct - a.sharesPct)
  const rankedHoldings = holdings.slice(0, 20)

  // summary
  const allBuyers = [...filtered.values()].flat()
  if (allBuyers.length === 0) {
    return {
      sharesByStatusByHorse,
      revenuePipeline: { collected: Math.round(collected * 100) / 100, outstanding: Math.round(outstanding * 100) / 100 },
      rankedHoldings,
      summary: null,
    }
  }

  const activeBuyers = allBuyers.filter((b) => b.status !== 'not_proceeding')
  const avgShareSize = activeBuyers.length > 0
    ? activeBuyers.reduce((s, b) => s + Number(b.shares_pct), 0) / activeBuyers.length
    : 0

  const statusFreq = new Map<string, number>()
  for (const b of allBuyers) statusFreq.set(b.status, (statusFreq.get(b.status) ?? 0) + 1)
  const mostCommonStatus = [...statusFreq.entries()].sort((a, b) => b[1] - a[1])[0][0] as BuyerStatusKey

  const newest = [...allBuyers].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

  return {
    sharesByStatusByHorse,
    revenuePipeline: { collected: Math.round(collected * 100) / 100, outstanding: Math.round(outstanding * 100) / 100 },
    rankedHoldings,
    summary: {
      largestHolder: rankedHoldings[0]
        ? `${rankedHoldings[0].name} — ${rankedHoldings[0].sharesPct}% (${rankedHoldings[0].horseName})`
        : 'None',
      avgShareSize: Math.round(avgShareSize * 100) / 100,
      mostCommonStatus,
      newestBuyer: `${newest.first_name} ${newest.last_name ?? ''}`.trim(),
    },
  }
}
