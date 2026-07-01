/**
 * lib/api-logger.ts — Higher-order wrapper for Next.js API route handlers.
 *
 * Wraps any route handler to automatically:
 *  - Generate or propagate a request ID (x-request-id header)
 *  - Log request start (info), response (info), and errors (error)
 *  - Measure and log request duration
 *  - Never expose internal error details in the response body
 */

import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { logger } from './logger'

type RouteHandler = (
  req: NextRequest,
  context?: { params: Record<string, string> }
) => Promise<NextResponse | Response>

/**
 * Wraps a Next.js App Router route handler with structured logging.
 *
 * @example
 * export const GET = withLogging(async (req) => {
 *   return NextResponse.json({ ok: true })
 * })
 */
export function withLogging(handler: RouteHandler): RouteHandler {
  return async (req, context) => {
    const start = Date.now()

    // Propagate or generate a request ID
    const requestId =
      req.headers.get('x-request-id') ??
      crypto.randomUUID()

    const endpoint = new URL(req.url).pathname
    const method = req.method

    const log = logger.child({ requestId, endpoint, method })

    log.info('Request received')

    try {
      const response = await handler(req, context)

      const durationMs = Date.now() - start
      const statusCode =
        response instanceof NextResponse
          ? response.status
          : (response as Response).status

      log.info('Request completed', { statusCode, durationMs })

      // Attach request ID to response for client-side correlation
      if (response instanceof NextResponse) {
        response.headers.set('x-request-id', requestId)
      }

      return response
    } catch (error) {
      const durationMs = Date.now() - start

      log.error('Request failed with unhandled exception', error, {
        durationMs,
        statusCode: 500,
      })

      // Never expose raw error internals to clients
      return NextResponse.json(
        {
          error: 'Une erreur interne est survenue.',
          requestId, // Safe: just the correlation ID
        },
        {
          status: 500,
          headers: { 'x-request-id': requestId },
        }
      )
    }
  }
}
