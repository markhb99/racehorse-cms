import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server'
import { getAllSettings } from '@/lib/supabase/queries/settings'
import { getHorses, getAllActiveHorsesWithBuyers } from '@/lib/supabase/queries/horses'
import { computeDataHealth } from '@/lib/kpis'
import { listUsers } from '@/app/actions/users'
import { SettingsSections } from './settings-sections'

export const metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient()

  const [user, settings, usersResult] = await Promise.all([
    getServerUser(),
    getAllSettings(supabase),
    listUsers(),
  ])

  // These are non-critical — if they fail, show empty state rather than crash
  let archivedHorses: Awaited<ReturnType<typeof getHorses>> = []
  let healthIssues: ReturnType<typeof computeDataHealth> = []
  try {
    const [archived, { horses, buyersByHorse }] = await Promise.all([
      getHorses(supabase, { status: 'archived' }),
      getAllActiveHorsesWithBuyers(supabase),
    ])
    archivedHorses = archived
    healthIssues = computeDataHealth(horses, buyersByHorse)
  } catch {
    // Non-fatal: page renders without archived horses / health data
  }

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
      <SettingsSections
        projectName={settings.project_name ?? 'Racehorse Share CMS'}
        email={user?.email ?? ''}
        archivedHorses={archivedHorses}
        healthIssues={healthIssues}
        users={usersResult.ok ? usersResult.data : []}
      />
    </div>
  )
}
