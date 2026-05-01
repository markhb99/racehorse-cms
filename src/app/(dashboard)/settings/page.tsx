import { Settings } from 'lucide-react'
import { EmptyState } from '@/components/feedback/empty-state'

export const metadata = { title: 'Settings' }

// Phase 6 replaces this with the full settings form
export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <EmptyState
        icon={Settings}
        title="Settings coming soon"
        description="Project name, password change, archived horses, and data health check will be built in Phase 6."
      />
    </div>
  )
}
