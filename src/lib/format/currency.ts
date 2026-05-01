export function formatCurrency(
  amount: number | string | null | undefined,
  currency = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? 'AUD',
): string {
  const value = Number(amount ?? 0)
  if (isNaN(value)) return '$0.00'
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}
