/**
 * app/api/health/route.ts — Production-grade health check endpoint
 *
 * GET  /api/health        — Full readiness check (DB + Redis + Storage)
 * HEAD /api/health        — Liveness check (is process alive?) — used by OfflineIndicator
 *
 * Response codes:
 *   200 OK       — all critical deps healthy (status: "ok" or "degraded" for non-critical)
 *   503 Service  — critical dependency (database) is down
 *
 * Each check is wrapped in a 3-second timeout so one slow dep
 * doesn't hang the entire health endpoint.
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const TIMEOUT_MS = 3000
const VERSION = process.env.npm_package_version ?? '1.0.0'

type CheckStatus = 'ok' | 'error' | 'timeout' | 'unconfigured'

interface CheckResult {
  status: CheckStatus
  latencyMs?: number
  detail?: string
}

/** Race a promise against a timeout. Returns a timeout result if exceeded. */
async function withTimeout<T>(
  fn: () => Promise<T>,
  ms: number
): Promise<{ result?: T; timedOut: boolean }> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), ms)
  )
  try {
    const result = await Promise.race([fn(), timeout])
    return { result, timedOut: false }
  } catch (err) {
    return { timedOut: true }
  }
}

async function checkDatabase(): Promise<CheckResult> {
  const start = Date.now()
  const { result, timedOut } = await withTimeout(
    () => db.$queryRaw<[{ result: number }]>`SELECT 1 AS result`,
    TIMEOUT_MS
  )
  if (timedOut) return { status: 'timeout', latencyMs: TIMEOUT_MS }
  if (!result) return { status: 'error', detail: 'No result returned' }
  return { status: 'ok', latencyMs: Date.now() - start }
}

async function checkRedis(): Promise<CheckResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return { status: 'unconfigured' }

  const start = Date.now()
  const { result, timedOut } = await withTimeout(async () => {
    const res = await fetch(`${url}/ping`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    return res.ok
  }, TIMEOUT_MS)

  if (timedOut) return { status: 'timeout', latencyMs: TIMEOUT_MS }
  return result
    ? { status: 'ok', latencyMs: Date.now() - start }
    : { status: 'error', detail: 'Ping failed' }
}

async function checkStorage(): Promise<CheckResult> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  if (!cloudName) return { status: 'unconfigured' }

  const start = Date.now()
  const { result, timedOut } = await withTimeout(async () => {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/ping`,
      { cache: 'no-store' }
    )
    return res.ok
  }, TIMEOUT_MS)

  if (timedOut) return { status: 'timeout', latencyMs: TIMEOUT_MS }
  return result
    ? { status: 'ok', latencyMs: Date.now() - start }
    : { status: 'error', detail: 'Storage ping failed' }
}

// HEAD — lightweight liveness check (process is running)
export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}

// GET — full readiness check
export async function GET(_req: NextRequest) {
  const start = Date.now()

  // Run all checks in parallel
  const [dbCheck, redisCheck, storageCheck] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkStorage(),
  ])

  const checks = {
    database: dbCheck,
    redis: redisCheck,
    storage: storageCheck,
  }

  // DB is critical — if it fails, entire service is unavailable
  const dbHealthy = dbCheck.status === 'ok'
  // Redis and Storage are non-critical — degraded, not down
  const allHealthy =
    dbHealthy &&
    redisCheck.status !== 'error' &&
    storageCheck.status !== 'error'

  const overallStatus = !dbHealthy
    ? 'error'
    : !allHealthy
    ? 'degraded'
    : 'ok'

  const httpStatus = overallStatus === 'error' ? 503 : 200

  const body = {
    status: overallStatus,
    version: VERSION,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    responseMs: Date.now() - start,
    checks,
  }

  return NextResponse.json(body, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Health-Status': overallStatus,
    },
  })
}
