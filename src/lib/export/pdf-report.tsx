import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer'
import { BUYER_STATUSES } from '../constants'
import type { BuyerStatusKey } from '../constants'
import type { Horse, Buyer, HorseStats } from '../types'
import { formatCurrency } from '../format/currency'
import { formatPercent } from '../format/percent'

const s = StyleSheet.create({
  page:        { padding: 36, fontSize: 9, fontFamily: 'Helvetica' },
  h1:          { fontSize: 18, fontFamily: 'Helvetica-Bold', marginBottom: 3 },
  subtitle:    { fontSize: 10, color: '#6B7280', marginBottom: 18 },
  h2:          { fontSize: 11, fontFamily: 'Helvetica-Bold', marginTop: 18, marginBottom: 8 },
  kpiRow:      { flexDirection: 'row', gap: 10, marginBottom: 16 },
  kpiBox:      { flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 4, padding: 9 },
  kpiLabel:    { fontSize: 7, color: '#9CA3AF', marginBottom: 3, textTransform: 'uppercase' },
  kpiValue:    { fontSize: 13, fontFamily: 'Helvetica-Bold' },
  table:       { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 4 },
  tHead:       { flexDirection: 'row', backgroundColor: '#F3F4F6', borderBottomWidth: 1, borderColor: '#E5E7EB' },
  tRow:        { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#F3F4F6' },
  tRowAlt:     { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#F3F4F6', backgroundColor: '#F9FAFB' },
  cell:        { paddingVertical: 5, paddingHorizontal: 6, fontSize: 8 },
  cellBold:    { paddingVertical: 5, paddingHorizontal: 6, fontSize: 8, fontFamily: 'Helvetica-Bold' },
  statusRow:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderColor: '#F3F4F6' },
  footer:      { position: 'absolute', bottom: 20, left: 36, right: 36, flexDirection: 'row', justifyContent: 'space-between', color: '#9CA3AF', fontSize: 7 },
})

// Column widths
const W = {
  num:    '5%',
  name:   '19%',
  shares: '8%',
  status: '17%',
  inv:    '11%',
  paid:   '11%',
  out:    '11%',
  rem:    '18%',
}

interface Props { horse: Horse; buyers: Buyer[]; stats: HorseStats }

function HorseReport({ horse, buyers, stats }: Props) {
  const sorted = [...buyers].sort((a, b) => Number(b.shares_pct) - Number(a.shares_pct))
  const date = new Date().toLocaleDateString('en-AU', { day: '2-digit', month: 'long', year: 'numeric' })
  const statusEntries = Object.entries(stats.statusCounts).filter(([, n]) => n > 0)

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={s.page}>
        {/* Header */}
        <Text style={s.h1}>{horse.display_name}</Text>
        <Text style={s.subtitle}>Share Sales Report — {date}</Text>

        {/* KPI row */}
        <View style={s.kpiRow}>
          <View style={s.kpiBox}>
            <Text style={s.kpiLabel}>Shares Sold</Text>
            <Text style={s.kpiValue}>{formatPercent(stats.sharesSoldPct, 1)}</Text>
          </View>
          <View style={s.kpiBox}>
            <Text style={s.kpiLabel}>Collected</Text>
            <Text style={s.kpiValue}>{formatCurrency(stats.collectedTotal)}</Text>
          </View>
          <View style={s.kpiBox}>
            <Text style={s.kpiLabel}>Outstanding</Text>
            <Text style={s.kpiValue}>{formatCurrency(stats.outstandingTotal)}</Text>
          </View>
          <View style={s.kpiBox}>
            <Text style={s.kpiLabel}>Total Buyers</Text>
            <Text style={s.kpiValue}>{stats.buyerCount}</Text>
          </View>
        </View>

        {/* Buyer table */}
        <Text style={s.h2}>Buyers</Text>
        <View style={s.table}>
          {/* Header */}
          <View style={s.tHead}>
            <Text style={[s.cellBold, { width: W.num }]}>#</Text>
            <Text style={[s.cellBold, { width: W.name }]}>Name</Text>
            <Text style={[s.cellBold, { width: W.shares }]}>Shares</Text>
            <Text style={[s.cellBold, { width: W.status }]}>Status</Text>
            <Text style={[s.cellBold, { width: W.inv }]}>Invoice</Text>
            <Text style={[s.cellBold, { width: W.paid }]}>Paid</Text>
            <Text style={[s.cellBold, { width: W.out }]}>Outstanding</Text>
            <Text style={[s.cellBold, { width: W.rem }]}>Remarks</Text>
          </View>
          {/* Rows */}
          {sorted.map((b, i) => {
            const inv  = Number(b.invoice_amount)
            const paid = Number(b.paid_amount)
            const out  = Math.max(0, inv - paid)
            const name = `${b.first_name} ${b.last_name ?? ''}`.trim()
            const label = BUYER_STATUSES[b.status as BuyerStatusKey]?.label ?? b.status
            const rowStyle = i % 2 === 1 ? s.tRowAlt : s.tRow
            return (
              <View key={b.id} style={rowStyle}>
                <Text style={[s.cell, { width: W.num }]}>{i + 1}</Text>
                <Text style={[s.cell, { width: W.name }]}>{name}</Text>
                <Text style={[s.cell, { width: W.shares }]}>{Number(b.shares_pct).toFixed(1)}%</Text>
                <Text style={[s.cell, { width: W.status }]}>{label}</Text>
                <Text style={[s.cell, { width: W.inv }]}>{formatCurrency(inv)}</Text>
                <Text style={[s.cell, { width: W.paid }]}>{formatCurrency(paid)}</Text>
                <Text style={[s.cell, { width: W.out }]}>{formatCurrency(out)}</Text>
                <Text style={[s.cell, { width: W.rem }]}>{b.remarks ?? ''}</Text>
              </View>
            )
          })}
        </View>

        {/* Status breakdown */}
        {statusEntries.length > 0 && (
          <>
            <Text style={s.h2}>Status Breakdown</Text>
            {statusEntries.map(([key, count]) => (
              <View key={key} style={s.statusRow}>
                <Text>{BUYER_STATUSES[key as BuyerStatusKey]?.label ?? key}</Text>
                <Text>{count}</Text>
              </View>
            ))}
          </>
        )}

        {/* Footer */}
        <View fixed style={s.footer}>
          <Text>{horse.display_name} — Racehorse Share CMS</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}

export async function generateReport(horse: Horse, buyers: Buyer[], stats: HorseStats): Promise<Buffer> {
  return renderToBuffer(<HorseReport horse={horse} buyers={buyers} stats={stats} />)
}
