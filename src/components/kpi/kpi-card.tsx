import { type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface KpiCardProps {
  label: string
  value: string | number
  hint?: string
  icon?: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}

export function KpiCard({ label, value, hint, icon: Icon, className }: KpiCardProps) {
  return (
    <Card className={cn('shadow-sm hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider leading-tight">
            {label}
          </p>
          {Icon && (
            <div className="rounded-lg bg-primary/10 p-1.5 shrink-0">
              <Icon className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>
        <p className="mt-2 text-lg font-semibold tracking-tight tabular-nums sm:text-xl">{value}</p>
        {hint && (
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        )}
      </CardContent>
    </Card>
  )
}
