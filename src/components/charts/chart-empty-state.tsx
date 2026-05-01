import { BarChart3 } from 'lucide-react'

interface ChartEmptyStateProps {
  message?: string
  height?: number
}

export function ChartEmptyState({ message = 'No data yet', height = 240 }: ChartEmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground"
      style={{ height }}
    >
      <BarChart3 className="h-8 w-8 opacity-30" />
      <p className="text-sm">{message}</p>
    </div>
  )
}
