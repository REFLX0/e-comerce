import { NextRequest, NextResponse } from 'next/server'

function getBackendUrl(): string {
  if (process.env.API_URL) return process.env.API_URL
  if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.startsWith('/')) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  return 'http://backend:4000/api'
}

export async function POST(req: NextRequest) {
  try {
    const backendUrl = getBackendUrl()
    const body = await req.json()

    const res = await fetch(`${backendUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': req.headers.get('x-forwarded-for') || '',
        'X-Real-IP': req.headers.get('x-real-ip') || '',
      },
      body: JSON.stringify(body),
    })

    const data = await res.json().catch(() => ({}))
    const response = NextResponse.json(data, { status: res.status })

    // Forward all Set-Cookie headers from backend to browser
    const rawCookies = res.headers.getSetCookie?.() || []
    if (rawCookies.length > 0) {
      rawCookies.forEach((cookie) => {
        response.headers.append('set-cookie', cookie)
      })
    } else {
      const singleCookie = res.headers.get('set-cookie')
      if (singleCookie) {
        response.headers.set('set-cookie', singleCookie)
      }
    }

    return response
  } catch (error) {
    console.error('[API /api/auth/login] Error proxying to backend:', error)
    return NextResponse.json({ message: 'Erreur de connexion au serveur' }, { status: 500 })
  }
}
