import { CardGridSkeleton } from '@/components/feedback/loading-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function HorsesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-28" />
      </div>
      <Skeleton className="h-9 w-64" />
      <CardGridSkeleton count={6} />
    </div>
  )
}
