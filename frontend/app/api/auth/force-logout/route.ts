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

  const response = NextResponse.redirect(new URL(target, req.nextUrl.origin))
  for (const name of AUTH_COOKIES) {
    response.cookies.set(name, '', { path: '/', maxAge: 0 })
  }
  return response
}
