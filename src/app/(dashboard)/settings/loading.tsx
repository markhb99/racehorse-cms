import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsLoading() {
  return (
    <div className="max-w-2xl space-y-8">
      <Skeleton className="h-9 w-28" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border p-5 space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-24" />
        </div>
      ))}
    </div>
  )
}
