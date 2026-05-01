// Phase 5 — fuzzy-maps status strings from Excel to BUYER_STATUSES keys.

import type { BuyerStatusKey } from '../constants'
import { BUYER_STATUSES } from '../constants'

export function mapStatus(raw: string): { key: BuyerStatusKey; warning?: string } {
  const lower = raw.trim().toLowerCase()

  for (const [key, def] of Object.entries(BUYER_STATUSES)) {
    if (
      lower === key ||
      lower === def.label.toLowerCase() ||
      def.label.toLowerCase().includes(lower)
    ) {
      return { key: key as BuyerStatusKey }
    }
  }

  return {
    key: 'pending',
    warning: `Unknown status "${raw}" — defaulted to "Pending Confirmation"`,
  }
}
