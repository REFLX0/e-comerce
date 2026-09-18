import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const BACKEND_TIMEOUT_MS = 3000

function getBackendHealthUrl(): string {
  if (process.env.API_PROXY_ORIGIN) {
    return `${process.env.API_PROXY_ORIGIN.replace(/\/$/, '')}/api/health`
  }
  if (process.env.API_URL) {
    return `${process.env.API_URL.replace(/\/api\/?$/, '')}/api/health`
  }
  return 'http://localhost:4000/api/health'
}

type BackendProbe =
  | { ok: true; body: unknown }
  | { ok: false; reason: string }

async function probeBackend(method: 'GET' | 'HEAD'): Promise<BackendProbe> {
  try {
    const res = await fetch(getBackendHealthUrl(), {
      method,
      cache: 'no-store',
      signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
    })
    if (!res.ok) {
      return { ok: false, reason: `backend returned HTTP ${res.status}` }
    }
    if (method === 'HEAD') return { ok: true, body: null }
    return { ok: true, body: await res.json().catch(() => null) }
  } catch (err) {
    return { ok: false, reason: (err as Error).message || 'backend unreachable' }
  }
}

/**
 * This endpoint is what the container healthcheck and the external uptime
 * monitor gate on. It used to return 200 unconditionally - including from the
 * catch block - so a completely dead backend still reported healthy and the
 * runbook's `curl -sf /api/health` check could never fail.
 */
export async function HEAD() {
  const probe = await probeBackend('HEAD')
  return new NextResponse(null, { status: probe.ok ? 200 : 503 })
}

export async function GET() {
  const probe = await probeBackend('GET')

  if (!probe.ok) {
    return NextResponse.json(
      { status: 'error', frontend: 'ok', backend: 'unreachable', detail: probe.reason },
      { status: 503 },
    )
  }

  return NextResponse.json(
    { status: 'ok', frontend: 'ok', backend: probe.body ?? 'ok' },
    { status: 200 },
  )
}
