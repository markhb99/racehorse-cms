import { BarChart3 } from 'lucide-react'
import { EmptyState } from '@/components/feedback/empty-state'

export const metadata = { title: 'Analytics' }

// Phase 4 replaces this with real charts
export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
      <EmptyState
        icon={BarChart3}
        title="Analytics coming soon"
        description="Cross-horse charts and ranked holdings will be built in Phase 4."
      />
    </div>
  )
}
