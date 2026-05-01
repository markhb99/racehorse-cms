import { notFound } from 'next/navigation'
import { EmptyState } from '@/components/feedback/empty-state'
import { Trophy } from 'lucide-react'

interface HorseDetailPageProps {
  params: Promise<{ id: string }>
}

export const metadata = { title: 'Horse Detail' }

// Phase 3 replaces this with full horse detail + buyer table
export default async function HorseDetailPage({ params }: HorseDetailPageProps) {
  const { id } = await params

  if (!id) notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Horse Detail</h1>
      <p className="text-sm text-muted-foreground">Horse ID: {id}</p>
      <EmptyState
        icon={Trophy}
        title="Horse detail coming soon"
        description="The full horse detail page with buyer table will be built in Phase 3."
      />
    </div>
  )
}
