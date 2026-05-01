import { z } from 'zod'

export const parsedBuyerSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
  shares_pct: z.number().gt(0).max(100),
  status: z.enum([
    'completed',
    'awaiting_payment',
    'awaiting_docs',
    'awaiting_form',
    'pending',
    'not_proceeding',
  ]),
  invoice_amount: z.number().min(0).default(0),
  paid_amount: z.number().min(0).default(0),
  remarks: z.string().optional().nullable(),
  _rowWarning: z.string().optional(),
})

export const importPayloadSchema = z.object({
  horseId: z.string().uuid('Invalid horse ID'),
  rows: z.array(parsedBuyerSchema).min(1, 'No valid rows to import').max(500),
})

export type ParsedBuyer = z.infer<typeof parsedBuyerSchema>
export type ImportPayload = z.infer<typeof importPayloadSchema>
