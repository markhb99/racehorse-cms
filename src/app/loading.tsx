import { PageSkeleton } from '@/components/feedback/loading-skeleton'

// Loading fallback for the root dashboard page (outside the (dashboard) group)
export default function RootLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="md:pl-60 flex flex-col min-h-screen">
        <div className="h-14 border-b" />
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
          <PageSkeleton />
        </main>
      </div>
    </div>
  )
}
