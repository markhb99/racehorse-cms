import { Skeleton } from '@/components/ui/skeleton'

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-52 rounded-lg" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-4 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-32" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border p-5 space-y-3">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="rounded-xl border p-5 space-y-3">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
      <div className="rounded-xl border p-5 space-y-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  )
}
