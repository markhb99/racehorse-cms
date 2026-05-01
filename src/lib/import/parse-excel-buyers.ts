import * as XLSX from 'xlsx'
import { mapStatus } from './status-mapper'
import type { ParsedBuyer } from '../schemas/import'

export interface ParseResult {
  rows: ParsedBuyer[]
  warnings: string[]
}

function toNum(val: unknown): number {
  const n = Number(val)
  return isNaN(n) ? 0 : n
}

function toStr(val: unknown): string {
  if (val == null) return ''
  return String(val).trim()
}

function isSkipRow(row: unknown[]): boolean {
  const firstName = toStr(row[2]).toUpperCase()
  return (
    firstName.includes('CONFIRMED') ||
    firstName.includes('TOTAL') ||
    firstName.includes('SUBTOTAL') ||
    firstName === ''
  )
}

export async function parseExcelBuyers(arrayBuffer: ArrayBuffer): Promise<ParseResult> {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]

  // sheet_to_json with header:1 gives array-of-arrays, 0-indexed
  // Excel Row 1 = index 0 (horse title)
  // Excel Row 4 = index 3 (column headers)
  // Excel Row 6+ = index 5+ (buyer data)
  // Col A=0, B=1(shares%), C=2(first), D=3(last), E=4(email), F=5(phone), G=6(status), H=7(invoice), I=8(paid), J=9(remarks)
  const rawRows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: null,
    blankrows: true,
  })

  const buyers: ParsedBuyer[] = []
  const warnings: string[] = []

  for (let i = 5; i < rawRows.length; i++) {
    const row = rawRows[i]
    if (!row || row.every((c) => c == null || c === '')) continue
    if (isSkipRow(row)) continue

    const sharesPct = toNum(row[1])
    // Skip totals rows (shares >= 99.9%) and zero-share rows
    if (sharesPct <= 0 || sharesPct >= 99.9) continue

    const firstName = toStr(row[2])
    if (!firstName) continue

    const rawStatus = toStr(row[6])
    const { key: status, warning } = mapStatus(rawStatus || 'pending')
    if (warning) warnings.push(`Row ${i + 1}: ${warning}`)

    buyers.push({
      first_name: firstName,
      last_name: toStr(row[3]) || null,
      email: toStr(row[4]) || null,
      phone: toStr(row[5]) || null,
      shares_pct: sharesPct,
      status,
      invoice_amount: toNum(row[7]),
      paid_amount: toNum(row[8]),
      remarks: toStr(row[9]) || null,
    })
  }

  return { rows: buyers, warnings }
}
