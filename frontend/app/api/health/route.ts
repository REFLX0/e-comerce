import { NextRequest, NextResponse } from 'next/server'

function getBackendHealthUrl(): string {
  if (process.env.API_PROXY_ORIGIN) {
    return `${process.env.API_PROXY_ORIGIN.replace(/\/$/, '')}/api/health`
  }
  if (process.env.API_URL) {
    return `${process.env.API_URL.replace(/\/api\/?$/, '')}/api/health`
  }
  return 'http://localhost:4000/api/health'
}

export async function HEAD() {
  try {
    const res = await fetch(getBackendHealthUrl(), { method: 'HEAD', cache: 'no-store', signal: AbortSignal.timeout(3000) })
    return new NextResponse(null, { status: 200 })
  } catch {
    return new NextResponse(null, { status: 200 })
  }
}

export async function GET(_req: NextRequest) {
  try {
    const res = await fetch(getBackendHealthUrl(), { cache: 'no-store', signal: AbortSignal.timeout(3000) })
    const body = res.ok ? await res.json() : { status: 'ok', backend: 'pending' }
    return NextResponse.json(body, { status: 200 })
  } catch {
    return NextResponse.json({ status: 'ok', backend: 'standalone' }, { status: 200 })
  }
}
