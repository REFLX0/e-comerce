import { NextRequest, NextResponse } from 'next/server'

const BACKEND_HEALTH = 'http://nginx:8082/api/health'

export async function HEAD() {
  try {
    const res = await fetch(BACKEND_HEALTH, { method: 'HEAD', cache: 'no-store', signal: AbortSignal.timeout(5000) })
    return new NextResponse(null, { status: res.ok ? 200 : 503 })
  } catch {
    return new NextResponse(null, { status: 503 })
  }
}

export async function GET(_req: NextRequest) {
  try {
    const res = await fetch(BACKEND_HEALTH, { cache: 'no-store', signal: AbortSignal.timeout(5000) })
    const body = res.ok ? await res.json() : { status: 'error' }
    return NextResponse.json(body, { status: res.ok ? 200 : 503 })
  } catch {
    return NextResponse.json({ status: 'error', detail: 'backend unreachable' }, { status: 503 })
  }
}
