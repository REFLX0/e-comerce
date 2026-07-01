import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

const { auth } = NextAuth(authConfig)
const intlMiddleware = createMiddleware(routing)

export default auth((req: NextRequest & { auth?: unknown }) => {
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
    `img-src 'self' blob: data: https://res.cloudinary.com https://images.unsplash.com https://www.google.com`,
    `connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL ?? ''} https://api.cloudinary.com https://www.upstash.io`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-src 'none'`,
    `frame-ancestors 'none'`,
  ].join('; ')

  // ── 4. Route protection ───────────────────────────────────────────────
  const { nextUrl } = req
  const isLoggedIn = !!(req as { auth?: unknown }).auth
  const role = ((req as { auth?: { user?: { role?: string } } }).auth?.user as { role?: string })?.role

  // Remove locale prefix for auth checks
  const pathWithoutLocale = nextUrl.pathname.replace(/^\/(fr|en)/, '') || '/'
  
  const isAdminRoute  = pathWithoutLocale.startsWith('/admin')
  const isAuthRoute   = pathWithoutLocale.startsWith('/auth')
  const isCompteRoute = pathWithoutLocale.startsWith('/compte')

  if (isAdminRoute && (!isLoggedIn || role !== 'ADMIN')) {
    const redirect = NextResponse.redirect(new URL('/fr/auth/login', nextUrl))
    redirect.headers.set('x-request-id', requestId)
    return redirect
  }

  if (isCompteRoute && !isLoggedIn) {
    const redirect = NextResponse.redirect(new URL('/fr/auth/login', nextUrl))
    redirect.headers.set('x-request-id', requestId)
    return redirect
  }

  if (isAuthRoute && isLoggedIn) {
    const redirect = NextResponse.redirect(new URL('/fr', nextUrl))
    redirect.headers.set('x-request-id', requestId)
    return redirect
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
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp')

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
     *   - Public assets (.png, .jpg, .svg, .ico, .webp)
     *   - The health check endpoint (must be unrestricted)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|api/health|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?)$).*)',
  ],
}
