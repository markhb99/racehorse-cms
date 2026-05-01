import { z } from 'zod'

const buyerStatusEnum = z.enum([
  'completed',
  'awaiting_payment',
  'awaiting_docs',
  'awaiting_form',
  'pending',
  'not_proceeding',
])

export const createBuyerSchema = z.object({
  horse_id: z.string().uuid('Invalid horse ID'),
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(80, 'First name must be 80 characters or fewer'),
  last_name: z.string().max(80).optional().nullable(),
  email: z
    .union([z.string().email('Enter a valid email'), z.literal('')])
    .optional()
    .nullable(),
  phone: z.string().max(30).optional().nullable(),
  shares_pct: z
    .number({ error: 'Shares % must be a number' })
    .gt(0, 'Shares % must be greater than 0')
    .max(100, 'Shares % cannot exceed 100'),
  status: buyerStatusEnum.default('pending'),
  invoice_amount: z
    .number({ error: 'Invoice amount must be a number' })
    .min(0, 'Invoice amount cannot be negative')
    .default(0),
  paid_amount: z
    .number({ error: 'Paid amount must be a number' })
    .min(0, 'Paid amount cannot be negative')
    .default(0),
  remarks: z.string().max(2000).optional().nullable(),
})

export const updateBuyerSchema = createBuyerSchema.omit({ horse_id: true }).partial()

export const bulkUpdateStatusSchema = z.object({
  ids: z
    .array(z.string().uuid())
    .min(1, 'Select at least one buyer')
    .max(500, 'Too many buyers selected'),
  status: buyerStatusEnum,
})

export type CreateBuyerInput = z.infer<typeof createBuyerSchema>
export type UpdateBuyerInput = z.infer<typeof updateBuyerSchema>
export type BulkUpdateStatusInput = z.infer<typeof bulkUpdateStatusSchema>
