export const HORSE_COLORS = [
  '#2563EB', // blue
  '#16A34A', // green
  '#DC2626', // red
  '#9333EA', // purple
  '#EA580C', // orange
  '#0891B2', // cyan
  '#CA8A04', // yellow
  '#BE185D', // pink
] as const

export type HorseColor = (typeof HORSE_COLORS)[number]

export const BUYER_STATUSES = {
  completed: {
    key: 'completed',
    label: 'Completed',
    color: 'green',
    emoji: '✅',
    terminal: true,
  },
  awaiting_payment: {
    key: 'awaiting_payment',
    label: 'Awaiting Payment',
    color: 'yellow',
    emoji: '🟡',
    terminal: false,
  },
  awaiting_docs: {
    key: 'awaiting_docs',
    label: 'Awaiting Docs & Payment',
    color: 'orange',
    emoji: '🟠',
    terminal: false,
  },
  awaiting_form: {
    key: 'awaiting_form',
    label: 'Awaiting Form',
    color: 'blue',
    emoji: '🔵',
    terminal: false,
  },
  pending: {
    key: 'pending',
    label: 'Pending Confirmation',
    color: 'purple',
    emoji: '🟣',
    terminal: false,
  },
  not_proceeding: {
    key: 'not_proceeding',
    label: 'Not Proceeding',
    color: 'red',
    emoji: '🔴',
    terminal: true,
  },
} as const

export type BuyerStatusKey = keyof typeof BUYER_STATUSES

export const BUYER_STATUS_KEYS = Object.keys(
  BUYER_STATUSES,
) as BuyerStatusKey[]

export const TERMINAL_STATUSES: BuyerStatusKey[] = [
  'completed',
  'not_proceeding',
]

export const NON_TERMINAL_STATUSES: BuyerStatusKey[] = BUYER_STATUS_KEYS.filter(
  (k) => !TERMINAL_STATUSES.includes(k),
)
