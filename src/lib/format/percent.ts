export function formatPercent(
  value: number | string | null | undefined,
  decimals = 2,
): string {
  const num = Number(value ?? 0)
  if (isNaN(num)) return '0%'
  const fixed = parseFloat(num.toFixed(decimals))
  return `${fixed}%`
}
