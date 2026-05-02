import { NextResponse, type NextRequest } from 'next/server'

const SUPABASE_PROJECT_REF = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')
  .replace('https://', '')
  .split('.')[0]

function hasAuthCookie(request: NextRequest): boolean {
  const prefix = `sb-${SUPABASE_PROJECT_REF}-auth-token`
  return request.cookies.getAll().some((c) => c.name.startsWith(prefix) && c.value)
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isLoggedIn = hasAuthCookie(request)

  if (!isLoggedIn && pathname !== '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (isLoggedIn && pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.svg).*)'],
}
