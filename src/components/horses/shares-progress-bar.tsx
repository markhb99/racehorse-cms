import { cn } from '@/lib/utils'

interface SharesProgressBarProps {
  percent: number
  color: string
  size?: 'sm' | 'lg'
  className?: string
}

export function SharesProgressBar({ percent, color, size = 'sm', className }: SharesProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent))
  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-full bg-muted',
        size === 'sm' ? 'h-1.5' : 'h-3',
        className,
      )}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  )
}
