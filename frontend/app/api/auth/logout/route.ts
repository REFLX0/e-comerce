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
    const cookieHeader = req.headers.get('cookie') || ''

    const res = await fetch(`${backendUrl}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
    })

    const data = await res.json().catch(() => ({ success: true }))
    const response = NextResponse.json(data, { status: res.status })

    // Forward Set-Cookie (which deletes cookies)
    const rawCookies = res.headers.getSetCookie?.() || []
    if (rawCookies.length > 0) {
      rawCookies.forEach((cookie) => {
        response.headers.append('set-cookie', cookie)
      })
    } else {
      // Force clear in case backend didn't
      response.cookies.delete('access_token')
      response.cookies.delete('refresh_token')
    }

    return response
  } catch (error) {
    const response = NextResponse.json({ success: true })
    response.cookies.delete('access_token')
    response.cookies.delete('refresh_token')
    return response
  }
}
