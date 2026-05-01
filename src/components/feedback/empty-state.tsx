import { type LucideIcon, Inbox } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: LucideIcon
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-4">
      <div className="rounded-full bg-muted p-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-base">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
        )}
      </div>
      {action && (
        action.href ? (
          <a href={action.href} className={cn(buttonVariants({ variant: 'default', size: 'sm' }), 'mt-2')}>
            {action.label}
          </a>
        ) : (
          <Button variant="default" size="sm" className="mt-2" onClick={action.onClick}>
            {action.label}
          </Button>
        )
      )}
    </div>
  )
}
