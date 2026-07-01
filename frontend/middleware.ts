import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { NextRequest, NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

export default auth((req: NextRequest & { auth?: unknown }) => {
  // ── 1. Request ID — generated once per request, propagated everywhere ──
  // Used for log correlation between frontend errors and backend logs.
  const requestId =
    req.headers.get('x-request-id') ?? crypto.randomUUID()

  // ── 2. Nonce — used by the CSP script-src directive ───────────────────
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  // ── 3. Content-Security-Policy ────────────────────────────────────────
  // Hardened CSP with:
  //   - nonce-based script execution (no 'unsafe-inline' in production)
  //   - font-src includes Google Fonts (required for Inter/Poppins)
  //   - img-src includes Cloudinary and Unsplash only
  //   - connect-src restricted to known API and analytics endpoints
  //   - frame-ancestors: none (clickjacking protection)
  const isDev = process.env.NODE_ENV === 'development'

  const cspHeader = [
    `default-src 'self'`,
    // Scripts: nonce + strict-dynamic (production) or unsafe-eval (dev HMR)
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    // Styles: unsafe-inline required for Tailwind CSS-in-JS
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    // Fonts: self + Google Fonts CDN
    `font-src 'self' https://fonts.gstatic.com`,
    // Images: self, Cloudinary, Unsplash, data URIs, blobs
    `img-src 'self' blob: data: https://res.cloudinary.com https://images.unsplash.com https://www.google.com`,
    // XHR/fetch: self + known API endpoints
    `connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL ?? ''} https://api.cloudinary.com https://www.upstash.io`,
    // No plugins
    `object-src 'none'`,
    // No base tag hijacking
    `base-uri 'self'`,
    // Form submissions only to self
    `form-action 'self'`,
    // No iframing of this site
    `frame-src 'none'`,
    // No framing by external sites (clickjacking)
    `frame-ancestors 'none'`,
    // Force HTTPS in production
    ...(isDev ? [] : [`upgrade-insecure-requests`]),
  ].join('; ')

  // ── 4. Route protection ───────────────────────────────────────────────
  const { nextUrl } = req
  const isLoggedIn = !!(req as { auth?: unknown }).auth
  const role = ((req as { auth?: { user?: { role?: string } } }).auth?.user as { role?: string })?.role

  const isAdminRoute  = nextUrl.pathname.startsWith('/admin')
  const isAuthRoute   = nextUrl.pathname.startsWith('/auth')
  const isCompteRoute = nextUrl.pathname.startsWith('/compte')

  if (isAdminRoute && (!isLoggedIn || role !== 'ADMIN')) {
    const redirect = NextResponse.redirect(new URL('/auth/login', nextUrl))
    redirect.headers.set('x-request-id', requestId)
    return redirect
  }

  if (isCompteRoute && !isLoggedIn) {
    const redirect = NextResponse.redirect(new URL('/auth/login', nextUrl))
    redirect.headers.set('x-request-id', requestId)
    return redirect
  }

  if (isAuthRoute && isLoggedIn) {
    const redirect = NextResponse.redirect(new URL('/', nextUrl))
    redirect.headers.set('x-request-id', requestId)
    return redirect
  }

  // ── 5. Build response with all security headers ───────────────────────
  const response = NextResponse.next({
    request: { headers: new Headers(req.headers) },
  })

  // Tracing
  response.headers.set('x-request-id', requestId)
  response.headers.set('x-nonce', nonce)

  // CSP
  response.headers.set('Content-Security-Policy', cspHeader)

  // HSTS — 2 years, subdomains, preload
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  )

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

  // Cross-Origin isolation (required for SharedArrayBuffer, advanced features)
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp')

  // Remove fingerprinting header (belt-and-suspenders — next.config also sets this)
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
