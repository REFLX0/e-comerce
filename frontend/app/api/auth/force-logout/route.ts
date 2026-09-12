import { NextRequest, NextResponse } from 'next/server'

function getBackendUrl(): string {
  if (process.env.API_URL) return process.env.API_URL
  if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.startsWith('/')) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  return 'http://backend:4000/api'
}

// Both the bare and prefixed names are listed because the prefix depends on
// whether the deployment is running over HTTPS.
const AUTH_COOKIES = [
  'authjs.session-token',
  '__Secure-authjs.session-token',
  'authjs.csrf-token',
  '__Host-authjs.csrf-token',
  'authjs.callback-url',
  '__Secure-authjs.callback-url',
  'authjs.pkce.code_verifier',
  '__Secure-authjs.pkce.code_verifier',
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
  'access_token',
  'refresh_token',
]

/**
 * Full sign-out as a plain navigation.
 *
 * next-auth's own signOut() runs as a Server Action, so a browser still holding
 * a JS bundle from a previous deployment calls an action id the server no longer
 * knows about -- it fails silently and the user stays signed in. A GET route hit
 * by a normal page navigation has no such coupling to the build.
 */
export async function GET(req: NextRequest) {
  const requested = req.nextUrl.searchParams.get('callbackUrl') || '/'
  // Only allow same-site relative paths, otherwise this becomes an open redirect.
  const target = requested.startsWith('/') && !requested.startsWith('//') ? requested : '/'

  try {
    await fetch(`${getBackendUrl()}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: req.headers.get('cookie') || '',
      },
    })
  } catch {
    // Backend being unreachable must not block clearing the local session.
  }

  // A relative Location, rather than NextResponse.redirect(): behind the nginx
  // proxy req.nextUrl.origin is the container's own bind address, so building an
  // absolute URL from it sends the browser to http://0.0.0.0:3000. Browsers
  // resolve a relative Location against the request URL, which is the public one.
  const response = new NextResponse(null, { status: 307, headers: { Location: target } })
  const isHttps = req.nextUrl.protocol === 'https:'
  for (const name of AUTH_COOKIES) {
    // Browsers silently reject any Set-Cookie for a `__Secure-`/`__Host-`
    // prefixed name that lacks the `Secure` attribute -- including one meant
    // to clear it. Without this, __Secure-authjs.session-token (the cookie
    // Auth.js actually uses in production, since it enables secure cookies
    // automatically over HTTPS) never gets cleared: the backend's own
    // access_token/refresh_token cookies clear fine (no prefix, no such
    // rule), so email/password logout looked fixed while Google-authenticated
    // sessions stayed silently logged in.
    response.cookies.set(name, '', { path: '/', maxAge: 0, secure: isHttps, httpOnly: true })
  }
  return response
}
