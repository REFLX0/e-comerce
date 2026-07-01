/**
 * lib/api/circuit-breaker.ts — Lightweight in-memory circuit breaker
 *
 * Prevents cascading failures when an external service is down.
 * States:
 *   CLOSED     — Normal operation. Requests pass through.
 *   OPEN       — Service is failing. Requests fail fast (no I/O).
 *   HALF_OPEN  — Testing recovery. One request allowed through.
 *
 * Transitions:
 *   CLOSED → OPEN       after `failureThreshold` consecutive failures
 *   OPEN   → HALF_OPEN  after `recoveryTimeMs` has elapsed
 *   HALF_OPEN → CLOSED  if the test request succeeds
 *   HALF_OPEN → OPEN    if the test request fails
 */

export class CircuitBreakerOpenError extends Error {
  constructor(name: string) {
    super(`Circuit breaker OPEN for "${name}" — failing fast to protect the system`)
    this.name = 'CircuitBreakerOpenError'
  }
}

type State = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

interface CircuitBreakerOptions {
  /** Name for logging/identification */
  name: string
  /** Consecutive failures before opening. Default: 5 */
  failureThreshold?: number
  /** How long to wait before attempting recovery (ms). Default: 30_000 */
  recoveryTimeMs?: number
}

export class CircuitBreaker {
  private state: State = 'CLOSED'
  private failures = 0
  private lastFailureTime: number | null = null
  private readonly name: string
  private readonly failureThreshold: number
  private readonly recoveryTimeMs: number

  constructor(options: CircuitBreakerOptions) {
    this.name = options.name
    this.failureThreshold = options.failureThreshold ?? 5
    this.recoveryTimeMs = options.recoveryTimeMs ?? 30_000
  }

  /** Execute a function through the circuit breaker */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      const elapsed = Date.now() - (this.lastFailureTime ?? 0)
      if (elapsed >= this.recoveryTimeMs) {
        this.state = 'HALF_OPEN'
        // Fall through to attempt the request
      } else {
        throw new CircuitBreakerOpenError(this.name)
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (err) {
      this.onFailure()
      throw err
    }
  }

  private onSuccess() {
    this.failures = 0
    if (this.state === 'HALF_OPEN') {
      console.info(`[CircuitBreaker] "${this.name}" recovered — state: CLOSED`)
    }
    this.state = 'CLOSED'
  }

  private onFailure() {
    this.failures++
    this.lastFailureTime = Date.now()

    if (this.state === 'HALF_OPEN' || this.failures >= this.failureThreshold) {
      console.warn(
        `[CircuitBreaker] "${this.name}" opened after ${this.failures} failure(s)`
      )
      this.state = 'OPEN'
    }
  }

  getState(): State {
    return this.state
  }

  getStats() {
    return {
      name: this.name,
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
    }
  }

  /** Manual reset (e.g., after operator intervention) */
  reset() {
    this.state = 'CLOSED'
    this.failures = 0
    this.lastFailureTime = null
  }
}

// ── Pre-built circuit breakers for external dependencies ──────────────────
// These are module-level singletons so state persists across requests in the
// same Node.js process (Next.js server-side).

export const backendApiBreaker = new CircuitBreaker({
  name: 'backend-api',
  failureThreshold: 5,
  recoveryTimeMs: 30_000,
})

export const cloudinaryBreaker = new CircuitBreaker({
  name: 'cloudinary',
  failureThreshold: 3,
  recoveryTimeMs: 60_000,
})

export const emailBreaker = new CircuitBreaker({
  name: 'email-service',
  failureThreshold: 3,
  recoveryTimeMs: 60_000,
})

