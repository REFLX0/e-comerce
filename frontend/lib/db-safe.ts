/**
 * lib/db-safe.ts — Database safety utilities
 *
 * Wraps common Prisma operations with:
 *   - Automatic rollback on error (safeTransaction)
 *   - Query timeout protection (withQueryTimeout)
 *   - Safe pagination with enforced limits (paginate)
 *   - Sensitive field sanitization before logging (sanitizeForLog)
 *
 * Rule: Never modify production data without a rollback strategy.
 */

import 'server-only'
import { db } from './db'
import { logger } from './logger'
import type { Prisma } from '@prisma/client'

// ── safeTransaction ───────────────────────────────────────────────────────

/**
 * Wraps a Prisma transaction with structured logging and automatic rollback.
 *
 * Prisma transactions already roll back on throw — this wrapper adds
 * logging so you can see exactly which transaction failed, how long it
 * took, and what error occurred, without logging sensitive fields.
 *
 * @example
 * const order = await safeTransaction(async (tx) => {
 *   const order = await tx.order.create({ data: orderData })
 *   await tx.cartItem.deleteMany({ where: { userId } })
 *   return order
 * }, { label: 'create-order' })
 */
export async function safeTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
  options: { label?: string; timeoutMs?: number; requestId?: string } = {}
): Promise<T> {
  const { label = 'transaction', timeoutMs = 10_000, requestId } = options
  const start = Date.now()
  const log = logger.child({ requestId })

  log.info(`DB transaction start: ${label}`)

  try {
    const result = await db.$transaction(fn, {
      timeout: timeoutMs,
      maxWait: timeoutMs,
    })
    log.info(`DB transaction OK: ${label}`, { durationMs: Date.now() - start })
    return result
  } catch (error) {
    log.error(`DB transaction FAILED: ${label}`, error, {
      durationMs: Date.now() - start,
    })
    throw error // Re-throw — Prisma already rolled back
  }
}

// ── withQueryTimeout ──────────────────────────────────────────────────────

export class QueryTimeoutError extends Error {
  constructor(label: string, ms: number) {
    super(`Database query "${label}" timed out after ${ms}ms`)
    this.name = 'QueryTimeoutError'
  }
}

/**
 * Races a Prisma query against a timeout.
 *
 * Note: This races the JS promise — it does NOT cancel the in-flight
 * PostgreSQL query (use Prisma's built-in `timeout` in $transaction for that).
 * Use this for read queries where you want to return a cached fallback instead.
 *
 * @example
 * const products = await withQueryTimeout(
 *   () => db.product.findMany({ where: { isFeatured: true } }),
 *   'featured-products',
 *   3000
 * )
 */
export async function withQueryTimeout<T>(
  query: () => Promise<T>,
  label: string,
  timeoutMs = 3_000
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new QueryTimeoutError(label, timeoutMs)), timeoutMs)
  )
  return Promise.race([query(), timeout])
}

// ── paginate ──────────────────────────────────────────────────────────────

export interface PaginationInput {
  page?: number | string
  limit?: number | string
}

export interface PaginationResult {
  skip: number
  take: number
  page: number
  limit: number
}

const MAX_PAGE_SIZE = 100
const DEFAULT_PAGE_SIZE = 20

/**
 * Safe pagination helper. Clamps values to prevent abuse.
 *
 * - `limit` capped at 100 to prevent runaway queries
 * - `page` minimum 1
 * - Converts string inputs (from query params) to numbers
 *
 * @example
 * const { skip, take } = paginate({ page: req.page, limit: req.limit })
 * const items = await db.product.findMany({ skip, take })
 */
export function paginate(input: PaginationInput): PaginationResult {
  const page = Math.max(1, parseInt(String(input.page ?? '1'), 10) || 1)
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(String(input.limit ?? String(DEFAULT_PAGE_SIZE)), 10) || DEFAULT_PAGE_SIZE)
  )
  return {
    skip: (page - 1) * limit,
    take: limit,
    page,
    limit,
  }
}

// ── sanitizeForLog ────────────────────────────────────────────────────────

// Re-exported here for convenience — defined in logger.ts as the canonical source
export { sanitizeForLog } from './logger'

// ── assertRowsAffected ────────────────────────────────────────────────────

/**
 * Asserts that a Prisma write operation affected exactly `expected` rows.
 * Throws if the count doesn't match, preventing silent data corruption.
 *
 * @example
 * const result = await db.product.updateMany({ where: { id }, data })
 * assertRowsAffected(result.count, 1, 'update-product')
 */
export function assertRowsAffected(
  actual: number,
  expected: number,
  label: string
): void {
  if (actual !== expected) {
    const msg = `Expected ${expected} row(s) affected by "${label}", got ${actual}`
    logger.error(msg)
    throw new Error(msg)
  }
}

// ── idempotent upsert helper ──────────────────────────────────────────────

/**
 * Idempotent-safe upsert: tries to create, catches unique constraint
 * violations, and falls back to update. Useful for webhook handlers
 * where the same event may be delivered more than once.
 */
export async function idempotentUpsert<T>(
  create: () => Promise<T>,
  update: () => Promise<T>,
  label: string
): Promise<{ result: T; wasCreated: boolean }> {
  try {
    const result = await create()
    return { result, wasCreated: true }
  } catch (error) {
    // P2002 = Unique constraint violation (Prisma error code)
    if ((error as { code?: string }).code === 'P2002') {
      logger.info(`[idempotentUpsert] "${label}" already exists — updating instead`)
      const result = await update()
      return { result, wasCreated: false }
    }
    throw error
  }
}
