import { z } from 'zod'

export const createHorseSchema = z.object({
  display_name: z
    .string()
    .min(1, 'Name is required')
    .max(120, 'Name must be 120 characters or fewer'),
  total_shares: z
    .number({ error: 'Total shares must be a number' })
    .int('Total shares must be a whole number')
    .positive('Total shares must be greater than 0')
    .default(100),
  share_price_per_pct: z
    .number({ error: 'Price must be a number' })
    .min(0, 'Price cannot be negative')
    .default(0),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex code like #2563EB')
    .default('#2563EB'),
  status: z.enum(['active', 'sold', 'archived']).default('active'),
  notes: z.string().max(2000).optional().nullable(),
})

export const updateHorseSchema = createHorseSchema.partial()

export type CreateHorseInput = z.infer<typeof createHorseSchema>
export type UpdateHorseInput = z.infer<typeof updateHorseSchema>
