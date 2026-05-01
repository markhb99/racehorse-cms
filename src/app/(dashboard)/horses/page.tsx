import { Trophy } from 'lucide-react'
import { EmptyState } from '@/components/feedback/empty-state'

export const metadata = { title: 'Horses' }

// Phase 2 replaces this with HorsesPageClient + horse grid
export default function HorsesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Horses</h1>
      </div>
      <EmptyState
        icon={Trophy}
        title="No horses yet"
        description="Add your first horse to start tracking share sales. This page will be built in Phase 2."
      />
    </div>
  )
}
