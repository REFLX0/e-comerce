import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'
import { env } from '@/lib/env'

const { auth } = NextAuth(authConfig)
const intlMiddleware = createMiddleware(routing)
const SUPPORTED_LOCALES = ['fr', 'en', 'ar'] as const
const DEFAULT_LOCALE = 'fr'

async function getBackendAuth(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value
  if (!token) return null

  try {
    // Decode JWT payload without signature verification.
    // Security rationale: the access_token is an HttpOnly cookie set exclusively
    // by our NestJS backend — browser JS cannot read or forge it. The full HMAC
    // signature is re-verified by NestJS's JwtStrategy on every actual API call.
    // The middleware only needs the role for routing decisions.
    const parts = token.split('.')
    if (parts.length !== 3) return null

    // base64url → base64 → JSON
    const padded = parts[1]!.replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(padded))

    if (!payload || typeof payload.role !== 'string') return null

    // Honour the exp claim so expired tokens still redirect to login
    if (typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return { role: payload.role }
  } catch {
    return null
  }
}

export default auth(async (req: NextRequest & { auth?: unknown }) => {
  // ── 1. Request ID — generated once per request, propagated everywhere ──
  const requestId = req.headers.get('x-request-id') ?? crypto.randomUUID()

  // ── 2. Nonce — used by the CSP script-src directive ───────────────────
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  // ── 3. Content-Security-Policy ────────────────────────────────────────
  const isDev = process.env.NODE_ENV === 'development'

  const cspHeader = [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `img-src 'self' blob: data: https://res.cloudinary.com https://images.unsplash.com https://www.google.com https://imagedelivery.net`,
    `media-src 'self' data: blob:`,
    `connect-src 'self' ${env.NEXT_PUBLIC_API_URL ? new URL(env.NEXT_PUBLIC_API_URL, env.NEXT_PUBLIC_SITE_URL).origin : ''} ${isDev ? 'http://localhost:4000' : ''} https://api.cloudinary.com https://www.upstash.io https://www.google-analytics.com`.trim(),
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-src 'none'`,
    `frame-ancestors 'none'`,
  ].join('; ')

  // ── 4. Route protection ───────────────────────────────────────────────
  const { nextUrl } = req
  const backendAuth = await getBackendAuth(req)
  const isLoggedIn = !!(req as { auth?: unknown }).auth || !!backendAuth
  const nextAuthRole = (
    (req as { auth?: { user?: { role?: string } } }).auth?.user as { role?: string }
  )?.role
  const isAdmin = [backendAuth?.role, nextAuthRole].some(
    (authRole) => authRole?.toUpperCase() === 'ADMIN'
  )

  const pathnameParts = nextUrl.pathname.split('/')
  const locale = SUPPORTED_LOCALES.includes(pathnameParts[1] as (typeof SUPPORTED_LOCALES)[number])
    ? pathnameParts[1]
    : DEFAULT_LOCALE
  const withLocale = (path: string) => `/${locale}${path}`

  // Remove locale prefix for auth checks
  const pathWithoutLocale = nextUrl.pathname.replace(/^\/(?:fr|en|ar)/, '') || '/'

  // ── Category redirects ────────────────────────────────────────────────
  // "Pièces Auto" (pieces-auto) was merged into Automobile — keep old
  // bookmarks / indexed URLs working instead of 404ing. The same applies to
  // category slugs removed by backend/prisma/migrate-nav-taxonomy.ts
  // (filtres → auto-filtres, hydraulique → liquides-auto).
  const CATEGORY_REDIRECTS: Record<string, string> = {
    'pieces-auto': 'automobile',
    filtres: 'auto-filtres',
    hydraulique: 'liquides-auto',
  }
  const categorieMatch = pathWithoutLocale.match(/^\/categorie\/([^/]+)$/)
  const categorieSlug = categorieMatch?.[1]
  if (categorieSlug && CATEGORY_REDIRECTS[categorieSlug]) {
    const target = new URL(withLocale(`/categorie/${CATEGORY_REDIRECTS[categorieSlug]}`), nextUrl)
    target.search = nextUrl.search
    const redirect = NextResponse.redirect(target, 308)
    redirect.headers.set('x-request-id', requestId)
    return redirect
  }
  if (pathWithoutLocale === '/catalogue') {
    const categorySlug = nextUrl.searchParams.get('categorySlug')
    if (categorySlug && CATEGORY_REDIRECTS[categorySlug]) {
      const target = new URL(withLocale('/catalogue'), nextUrl)
      for (const [key, value] of nextUrl.searchParams.entries()) {
        target.searchParams.set(
          key,
          key === 'categorySlug' ? CATEGORY_REDIRECTS[categorySlug] : value
        )
      }
      const redirect = NextResponse.redirect(target, 308)
      redirect.headers.set('x-request-id', requestId)
      return redirect
    }
  }

  const isAdminRoute = pathWithoutLocale.startsWith('/admin')
  const isCompteRoute = pathWithoutLocale.startsWith('/compte')

  if (isAdminRoute && (!isLoggedIn || !isAdmin)) {
    const loginUrl = new URL(withLocale('/auth/login'), nextUrl)
    loginUrl.searchParams.set('callbackUrl', withLocale('/admin'))
    if (isLoggedIn) loginUrl.searchParams.set('reason', 'admin')
    const redirect = NextResponse.redirect(loginUrl)
    redirect.headers.set('x-request-id', requestId)
    return redirect
  }

  if (isCompteRoute) {
    if (!isLoggedIn) {
      const loginUrl = new URL(withLocale('/auth/login'), nextUrl)
      loginUrl.searchParams.set('callbackUrl', withLocale('/compte'))
      const redirect = NextResponse.redirect(loginUrl)
      redirect.headers.set('x-request-id', requestId)
      return redirect
    }
    if (isAdmin) {
      const adminUrl = new URL(withLocale('/admin'), nextUrl)
      const redirect = NextResponse.redirect(adminUrl)
      redirect.headers.set('x-request-id', requestId)
      return redirect
    }
  }

  // ── 5. Run next-intl middleware for localized routing ───────────────────
  const response = intlMiddleware(req)

  // ── 6. Build response with all security headers ───────────────────────

  // Tracing
  response.headers.set('x-request-id', requestId)
  response.headers.set('x-nonce', nonce)

  // CSP
  response.headers.set('Content-Security-Policy', cspHeader)

  // Prevent MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // No iframing
  response.headers.set('X-Frame-Options', 'DENY')

  // Referrer
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions Policy — minimal surface area
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()'
  )

  // Cross-Origin isolation
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  // Removed Cross-Origin-Embedder-Policy because it blocks third-party images (like imagedelivery.net) without CORP headers

  // Remove fingerprinting header
  response.headers.delete('x-powered-by')

  return response
})

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     *   - Next.js static files (_next/static)
     *   - Next.js image optimizer (_next/image)
     *   - favicon.ico
     *   - robots.txt and sitemap.xml (must not be locale-redirected)
     *   - Public assets (.png, .jpg, .svg, .ico, .webp, .avif, .txt, .xml)
     *   - The health check endpoint (must be unrestricted)
     */
    '/((?!api(?:/|$)|_next/static|_next/image|favicon\.ico|robots\.txt|sitemap\.xml|.*\.(?:png|jpg|jpeg|gif|svg|ico|webp|avif|woff2?|txt|xml)$).*)',
  ],
}
