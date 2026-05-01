// Phase 5 — implements Excel parsing for the legacy Streamlit format.
// Placeholder stub so the module is importable.

import type { ParsedBuyer } from '../schemas/import'

export interface ParseResult {
  rows: ParsedBuyer[]
  warnings: string[]
}

export async function parseExcelBuyers(
  _arrayBuffer: ArrayBuffer,
): Promise<ParseResult> {
  throw new Error('parseExcelBuyers not yet implemented — coming in Phase 5')
}
