import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/supabase/server'
import { LoginForm } from './login-form'

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getServerUser()
  if (user) redirect('/')

  const { error } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 px-4">
      <div className="w-full max-w-[420px]">
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="text-5xl" aria-hidden>🏇</div>
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight">Racehorse Share CMS</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to continue</p>
          </div>
        </div>
        <LoginForm serverError={error === 'not_authorised' ? 'Your account is not authorised to access this dashboard.' : undefined} />
        <p className="text-center text-xs text-muted-foreground mt-6">
          Single-admin access. Contact your administrator to reset your password.
        </p>
      </div>
    </div>
  )
}
