'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2, AlertTriangle, Info, RotateCcw, ShieldCheck, User, Tag,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateSetting, changePassword } from '@/app/actions/settings'
import { restoreHorse } from '@/app/actions/horses'
import type { HorseWithStats } from '@/lib/types'
import type { DataHealthIssue } from '@/lib/kpis'

interface SettingsSectionsProps {
  projectName: string
  email: string
  archivedHorses: HorseWithStats[]
  healthIssues: DataHealthIssue[]
}

function SectionCard({ title, icon: Icon, children }: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h2 className="font-semibold text-sm">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function ProjectNameForm({ currentName }: { currentName: string }) {
  const [name, setName] = useState(currentName)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      const result = await updateSetting({ key: 'project_name', value: name.trim() })
      if (result.ok) toast.success('Project name updated')
      else toast.error(result.error)
    })
  }

  return (
    <SectionCard title="Project Name" icon={Tag}>
      <div className="space-y-2">
        <Label htmlFor="project-name">Display name</Label>
        <Input
          id="project-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
        />
      </div>
      <Button
        size="sm"
        onClick={handleSave}
        disabled={isPending || !name.trim() || name.trim() === currentName}
      >
        {isPending ? 'Saving…' : 'Save'}
      </Button>
    </SectionCard>
  )
}

function PasswordChangeForm({ email }: { email: string }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      const result = await changePassword({ password, confirmPassword: confirm })
      if (result.ok) {
        toast.success('Password updated')
        setPassword('')
        setConfirm('')
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <SectionCard title="Account" icon={ShieldCheck}>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Signed in as <span className="font-medium text-foreground">{email}</span></p>
      </div>
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm new password</Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
        </div>
      </div>
      <Button
        size="sm"
        onClick={handleSave}
        disabled={isPending || password.length < 8 || password !== confirm}
      >
        {isPending ? 'Updating…' : 'Update Password'}
      </Button>
    </SectionCard>
  )
}

function ArchivedHorsesList({ horses }: { horses: HorseWithStats[] }) {
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleRestore(id: string) {
    setPendingId(id)
    startTransition(async () => {
      const result = await restoreHorse({ id })
      if (result.ok) {
        toast.success('Horse restored to active')
        router.refresh()
      } else {
        toast.error(result.error)
      }
      setPendingId(null)
    })
  }

  return (
    <SectionCard title="Archived Horses" icon={RotateCcw}>
      {horses.length === 0 ? (
        <p className="text-sm text-muted-foreground">No archived horses.</p>
      ) : (
        <ul className="divide-y text-sm">
          {horses.map((horse) => (
            <li key={horse.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: horse.color }}
                />
                <span className="truncate font-medium">{horse.display_name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {horse.stats.buyerCount} buyer{horse.stats.buyerCount !== 1 ? 's' : ''}
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRestore(horse.id)}
                disabled={isPending && pendingId === horse.id}
                className="shrink-0"
              >
                Restore
              </Button>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}

const SEVERITY_CONFIG = {
  error: { icon: AlertTriangle, className: 'text-destructive' },
  warn:  { icon: AlertTriangle, className: 'text-yellow-600 dark:text-yellow-400' },
  info:  { icon: Info,          className: 'text-muted-foreground' },
}

function DataHealthPanel({ issues }: { issues: DataHealthIssue[] }) {
  const errors = issues.filter((i) => i.severity === 'error')
  const warns  = issues.filter((i) => i.severity === 'warn')
  const infos  = issues.filter((i) => i.severity === 'info')
  const ordered = [...errors, ...warns, ...infos]

  return (
    <SectionCard title="Data Health" icon={CheckCircle2}>
      {ordered.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          All data looks healthy
        </div>
      ) : (
        <ul className="space-y-2 text-sm">
          {ordered.map((issue, i) => {
            const { icon: IssueIcon, className } = SEVERITY_CONFIG[issue.severity]
            return (
              <li key={i} className="flex items-start gap-2">
                <IssueIcon className={`h-4 w-4 shrink-0 mt-0.5 ${className}`} />
                <span>{issue.message}</span>
              </li>
            )
          })}
        </ul>
      )}
    </SectionCard>
  )
}

export function SettingsSections({
  projectName,
  email,
  archivedHorses,
  healthIssues,
}: SettingsSectionsProps) {
  return (
    <>
      <ProjectNameForm currentName={projectName} />
      <PasswordChangeForm email={email} />
      <ArchivedHorsesList horses={archivedHorses} />
      <DataHealthPanel issues={healthIssues} />
    </>
  )
}
