import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_PREFIXES = ['/dashboard']
const ADMIN_PREFIXES = ['/admin', '/api/admin']

export default auth((req: NextRequest & { auth: unknown }) => {
  const session = req.auth as { user?: { email?: string } } | null
  const isAuthenticated = !!session
  const { pathname } = req.nextUrl

  // ── Admin routes (/admin/* and /api/admin/*) ─────────────────────────────
  const isAdminRoute = ADMIN_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  if (isAdminRoute) {
    const isApiRoute = pathname.startsWith('/api/admin')

    // Not authenticated
    if (!isAuthenticated) {
      if (isApiRoute) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Authenticated but not admin email
    const userEmail = session?.user?.email ?? ''
    const adminEmail = process.env.ADMIN_EMAIL ?? ''
    if (!adminEmail || userEmail !== adminEmail) {
      if (isApiRoute) {
        return Response.json({ error: 'Forbidden' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
  }

  // ── Regular protected routes (/dashboard) ────────────────────────────────
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
