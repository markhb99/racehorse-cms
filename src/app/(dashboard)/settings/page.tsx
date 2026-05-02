import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server'
import { getAllSettings } from '@/lib/supabase/queries/settings'
import { getHorses, getAllActiveHorsesWithBuyers } from '@/lib/supabase/queries/horses'
import { computeDataHealth } from '@/lib/kpis'
import { listUsers } from '@/app/actions/users'
import { SettingsSections } from './settings-sections'

export const metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient()
  const [user, settings, archivedHorses, { horses, buyersByHorse }, usersResult] = await Promise.all([
    getServerUser(),
    getAllSettings(supabase),
    getHorses(supabase, { status: 'archived' }),
    getAllActiveHorsesWithBuyers(supabase),
    listUsers(),
  ])

  const healthIssues = computeDataHealth(horses, buyersByHorse)

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <SettingsSections
        projectName={settings.project_name ?? 'Racehorse Share CMS'}
        email={user?.email ?? ''}
        archivedHorses={archivedHorses}
        healthIssues={healthIssues}
        users={usersResult.ok ? usersResult.value : []}
      />
    </div>
  )
}
