import * as XLSX from 'xlsx'
import { BUYER_STATUSES } from '../constants'
import type { BuyerStatusKey } from '../constants'
import type { Horse, Buyer } from '../types'

export async function exportHorseBuyers(horse: Horse, buyers: Buyer[]): Promise<Buffer> {
  const sorted = [...buyers].sort((a, b) => Number(b.shares_pct) - Number(a.shares_pct))

  const data = sorted.map((b, i) => {
    const inv = Number(b.invoice_amount)
    const paid = Number(b.paid_amount)
    return {
      '#': i + 1,
      'First Name': b.first_name,
      'Last Name': b.last_name ?? '',
      'Email': b.email ?? '',
      'Phone': b.phone ?? '',
      'Shares %': Number(b.shares_pct),
      'Status': BUYER_STATUSES[b.status as BuyerStatusKey]?.label ?? b.status,
      'Invoice (AUD)': inv,
      'Paid (AUD)': paid,
      'Outstanding (AUD)': Math.max(0, inv - paid),
      'Remarks': b.remarks ?? '',
    }
  })

  const ws = XLSX.utils.json_to_sheet(data)

  ws['!cols'] = [
    { wch: 4 },   // #
    { wch: 14 },  // First Name
    { wch: 14 },  // Last Name
    { wch: 28 },  // Email
    { wch: 16 },  // Phone
    { wch: 10 },  // Shares %
    { wch: 24 },  // Status
    { wch: 14 },  // Invoice
    { wch: 14 },  // Paid
    { wch: 16 },  // Outstanding
    { wch: 32 },  // Remarks
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, horse.display_name.slice(0, 31))

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
}

export function exportFullBackup(data: {
  horses: Horse[]
  buyers: Buyer[]
  settings: Array<{ key: string; value: string; updated_at: string }>
}): Buffer {
  const wb = XLSX.utils.book_new()

  const horseRows = data.horses.map((h) => ({
    Name: h.display_name,
    Status: h.status,
    'Shares to Sell %': Number(h.total_shares),
    'Price per %': Number(h.share_price_per_pct),
    Colour: h.color,
    Notes: h.notes ?? '',
    Created: h.created_at,
    ID: h.id,
  }))
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(horseRows), 'Horses')

  const buyerRows = data.buyers.map((b) => ({
    'First Name': b.first_name,
    'Last Name': b.last_name ?? '',
    Email: b.email ?? '',
    Phone: b.phone ?? '',
    'Shares %': Number(b.shares_pct),
    Status: b.status,
    'Invoice (AUD)': Number(b.invoice_amount),
    'Paid (AUD)': Number(b.paid_amount),
    Remarks: b.remarks ?? '',
    'Horse ID': b.horse_id,
    Created: b.created_at,
    ID: b.id,
  }))
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(buyerRows), 'Buyers')

  const settingRows = data.settings.map((s) => ({
    Key: s.key,
    Value: s.value,
    Updated: s.updated_at,
  }))
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(settingRows), 'Settings')

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
}
