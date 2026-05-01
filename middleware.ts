import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const PUBLIC_PATHS = ['/login', '/auth/callback']

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  )
}

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  // Unauthenticated or anonymous user hitting a protected route → /login
  const isAuthenticated = user && !user.is_anonymous && user.email
  if (!isAuthenticated && !isPublicPath(pathname)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.delete('error')
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated user email not in allowlist → /login?error=not_authorised
  const allowlist = process.env.ADMIN_EMAIL_ALLOWLIST
  if (user && allowlist) {
    const allowed = allowlist
      .split(',')
      .map((e) => e.trim().toLowerCase())
    if (!allowed.includes((user.email ?? '').toLowerCase())) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      loginUrl.searchParams.set('error', 'not_authorised')
      return NextResponse.redirect(loginUrl)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|og.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
