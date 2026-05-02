import * as XLSX from 'xlsx'
import { mapStatus } from './status-mapper'
import type { ParsedBuyer } from '../schemas/import'

export interface ParseResult {
  rows: ParsedBuyer[]
  warnings: string[]
}

function toNum(val: unknown): number {
  if (val == null) return 0
  const s = String(val).replace(/[$,\s]/g, '')
  const n = Number(s)
  return isNaN(n) ? 0 : n
}

function toStr(val: unknown): string {
  if (val == null) return ''
  return String(val).trim()
}

function normalise(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '')
}

interface ColMap {
  headerRowIdx: number
  firstName: number
  lastName: number
  email: number
  phone: number
  sharesPct: number
  status: number
  invoice: number
  paid: number
  remarks: number
}

const HEADER_HINTS: Record<keyof Omit<ColMap, 'headerRowIdx'>, string[]> = {
  firstName:  ['firstname', 'first'],
  lastName:   ['lastname', 'last', 'surname'],
  email:      ['email', 'mail'],
  phone:      ['phone', 'mobile', 'contact', 'tel', 'cell', 'ph'],
  sharesPct:  ['shares', 'sharesp', 'pct', 'percent', 'shareholding', 'ownership'],
  status:     ['status'],
  invoice:    ['invoice'],
  paid:       ['paid'],
  remarks:    ['remarks', 'notes', 'comment'],
}

function detectByContent(rawRows: unknown[][], startRow: number, colCount: number): { email: number; phone: number } {
  // Scan up to 10 data rows to find which columns contain emails (have @)
  // and phone-like values
  const emailVotes = new Array(colCount).fill(0)

  for (let ri = startRow; ri < Math.min(startRow + 10, rawRows.length); ri++) {
    const row = rawRows[ri]
    if (!row) continue
    for (let ci = 0; ci < Math.min(row.length, colCount); ci++) {
      const s = toStr(row[ci])
      if (s.includes('@') && s.includes('.')) emailVotes[ci]++
    }
  }

  const emailCol = emailVotes.indexOf(Math.max(...emailVotes))
  return {
    email: Math.max(...emailVotes) > 0 ? emailCol : -1,
    phone: -1,
  }
}

function detectColumns(rawRows: unknown[][]): ColMap | null {
  for (let ri = 0; ri < Math.min(15, rawRows.length); ri++) {
    const row = rawRows[ri]
    if (!row) continue

    const normalised = row.map((c) => normalise(toStr(c)))
    const hasFirst  = normalised.some((c) => c.includes('first') || c.includes('name'))
    const hasShares = normalised.some((c) => c.includes('share') || c.includes('pct') || c.includes('percent'))
    if (!hasFirst || !hasShares) continue

    const map: Partial<ColMap> = { headerRowIdx: ri }

    for (const [field, hints] of Object.entries(HEADER_HINTS) as [keyof typeof HEADER_HINTS, string[]][]) {
      const idx = normalised.findIndex((c) => c && hints.some((h) => c.includes(h)))
      if (idx !== -1) map[field] = idx
    }

    if (map.firstName == null || map.sharesPct == null) continue

    // If email wasn't found by header, try content-based detection
    const colCount = row.length
    const contentFallback = (map.email == null || map.phone == null)
      ? detectByContent(rawRows, ri + 1, colCount)
      : { email: -1, phone: -1 }

    return {
      headerRowIdx: ri,
      firstName:  map.firstName,
      lastName:   map.lastName  ?? -1,
      email:      map.email     ?? contentFallback.email,
      phone:      map.phone     ?? contentFallback.phone,
      sharesPct:  map.sharesPct,
      status:     map.status    ?? -1,
      invoice:    map.invoice   ?? -1,
      paid:       map.paid      ?? -1,
      remarks:    map.remarks   ?? -1,
    }
  }
  return null
}

function colLetter(idx: number): string {
  let result = ''
  let n = idx
  do {
    result = String.fromCharCode(65 + (n % 26)) + result
    n = Math.floor(n / 26) - 1
  } while (n >= 0)
  return result
}

export async function parseExcelBuyers(arrayBuffer: ArrayBuffer): Promise<ParseResult> {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]

  const rawRows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: null,
    blankrows: true,
  })

  const cols = detectColumns(rawRows)
  if (!cols) {
    return {
      rows: [],
      warnings: ['Could not find a header row. Make sure the spreadsheet has columns for "First Name" and "Shares %".'],
    }
  }

  const buyers: ParsedBuyer[] = []
  const warnings: string[] = []

  // Diagnostic: report which columns were detected
  const detected: string[] = [
    `First Name → col ${colLetter(cols.firstName)}`,
    cols.lastName  >= 0 ? `Last Name → col ${colLetter(cols.lastName)}`   : null,
    cols.email     >= 0 ? `Email → col ${colLetter(cols.email)}`           : 'Email → NOT DETECTED',
    cols.phone     >= 0 ? `Phone → col ${colLetter(cols.phone)}`           : 'Phone → NOT DETECTED',
    `Shares % → col ${colLetter(cols.sharesPct)}`,
    cols.status    >= 0 ? `Status → col ${colLetter(cols.status)}`         : null,
    cols.invoice   >= 0 ? `Invoice → col ${colLetter(cols.invoice)}`       : null,
    cols.paid      >= 0 ? `Paid → col ${colLetter(cols.paid)}`             : null,
    cols.remarks   >= 0 ? `Remarks → col ${colLetter(cols.remarks)}`       : null,
  ].filter(Boolean) as string[]
  warnings.push(`Detected columns: ${detected.join(', ')}`)

  for (let i = cols.headerRowIdx + 1; i < rawRows.length; i++) {
    const row = rawRows[i]
    if (!row || row.every((c) => c == null || c === '')) continue

    const firstName = toStr(cols.firstName >= 0 ? row[cols.firstName] : null)
    if (!firstName) continue

    const upper = firstName.toUpperCase()
    if (upper.includes('TOTAL') || upper.includes('SUBTOTAL') || upper.includes('CONFIRMED')) continue

    const sharesPct = toNum(row[cols.sharesPct])
    if (sharesPct <= 0 || sharesPct >= 99.9) continue

    const rawStatus = cols.status >= 0 ? toStr(row[cols.status]) : ''
    const { key: status, warning } = mapStatus(rawStatus || 'pending')
    if (warning) warnings.push(`Row ${i + 1}: ${warning}`)

    buyers.push({
      first_name:     firstName,
      last_name:      cols.lastName >= 0  ? toStr(row[cols.lastName])  || null : null,
      email:          cols.email    >= 0  ? toStr(row[cols.email])     || null : null,
      phone:          cols.phone    >= 0  ? toStr(row[cols.phone])     || null : null,
      shares_pct:     sharesPct,
      status,
      invoice_amount: cols.invoice  >= 0  ? toNum(row[cols.invoice])   : 0,
      paid_amount:    cols.paid     >= 0  ? toNum(row[cols.paid])      : 0,
      remarks:        cols.remarks  >= 0  ? toStr(row[cols.remarks])   || null : null,
    })
  }

  return { rows: buyers, warnings }
}
