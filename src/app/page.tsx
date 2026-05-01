import { getServerUser } from '@/lib/supabase/server'
import { AppShell } from '@/components/shell/app-shell'
import { EmptyState } from '@/components/feedback/empty-state'
import { Trophy } from 'lucide-react'

// Dashboard overview — Phase 4 replaces EmptyState with real KPI/chart content
export default async function DashboardPage() {
  const user = await getServerUser()

  return (
    <AppShell email={user?.email ?? ''}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <EmptyState
          icon={Trophy}
          title="Dashboard coming soon"
          description="The overview dashboard with KPI cards and charts will be built in Phase 4. Add your first horse to get started."
          action={{ label: 'Go to Horses', href: '/horses' }}
        />
      </div>
    </AppShell>
  )
}
