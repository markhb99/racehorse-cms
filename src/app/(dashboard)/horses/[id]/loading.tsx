import { Skeleton } from '@/components/ui/skeleton'
import { KpiRowSkeleton, TableSkeleton } from '@/components/feedback/loading-skeleton'

export default function HorseDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <KpiRowSkeleton />
      <Skeleton className="h-3 w-full rounded-full" />
      <TableSkeleton rows={6} />
    </div>
  )
}
