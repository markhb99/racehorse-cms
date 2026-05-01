import { getServerUser } from '@/lib/supabase/server'
import { AppShell } from '@/components/shell/app-shell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getServerUser()
  // Middleware guarantees auth; user is always non-null here
  return <AppShell email={user?.email ?? ''}>{children}</AppShell>
}
