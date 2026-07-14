/**
 * lib/api/client.ts — Resilient HTTP client
 *
 * SINGLE source of truth for API base-URL resolution:
 *   - Server (SSR / route handlers): API_URL (internal network, e.g. http://nginx:8082/api)
 *   - Browser: NEXT_PUBLIC_API_URL (default '/api', proxied by Next rewrites)
 *
 * Exports (backward compatible): apiGet, apiPost, apiPut, apiPatch, apiDelete,
 * fetchWithTimeout, fetchWithRetry, createApiClient, backendClient.
 */

import {
  CircuitBreaker,
  HttpClientError,
  backendApiBreaker,
} from './circuit-breaker'

const DEFAULT_TIMEOUT_MS = 8_000

// ── Base URL resolution (unique, shared by ALL helpers) ────────────────────

export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    return (
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://nginx:8082/api'
    ).replace(/\/$/, '')
  }
  return (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/$/, '')
}

function toAbsolute(base: string): string {
  if (/^https?:\/\//i.test(base)) return base.replace(/\/$/, '')
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return `${origin.replace(/\/$/, '')}/${base.replace(/^\/|\/$/g, '')}`
}

function buildUrl(
  base: string,
  path: string,
  params?: Record<string, string | number | boolean | undefined>
): URL {
  const url = new URL(`${toAbsolute(base)}/${path.replace(/^\//, '')}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, String(v))
      }
    })
  }
  return url
}

// ── Error types ────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public requestId?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class FetchTimeoutError extends Error {
  constructor(url: string, ms: number) {
    super(`Request to "${url}" timed out after ${ms}ms`)
    this.name = 'FetchTimeoutError'
  }
}

export class FetchRetryExhaustedError extends Error {
  readonly attempts: number
  readonly lastStatus?: number
  constructor(url: string, attempts: number, lastStatus?: number) {
    super(
      `Request to "${url}" failed after ${attempts} attempt(s)${lastStatus ? ` (last HTTP ${lastStatus})` : ''}`
    )
    this.name = 'FetchRetryExhaustedError'
    this.attempts = attempts
    this.lastStatus = lastStatus
  }
}

// ── fetchWithTimeout ───────────────────────────────────────────────────────

export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      throw new FetchTimeoutError(url, timeoutMs)
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

// ── fetchWithRetry ─────────────────────────────────────────────────────────

export interface RetryOptions {
  retries?: number
  baseDelayMs?: number
  maxDelayMs?: number
  jitter?: number
  timeoutMs?: number
  retryOn?: number[]
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function jitteredDelay(base: number, attempt: number, jitter: number, cap: number): number {
  const exp = Math.min(base * Math.pow(2, attempt), cap)
  const noise = exp * jitter * (Math.random() * 2 - 1)
  return Math.max(0, exp + noise)
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  const {
    retries = 3,
    baseDelayMs = 100,
    maxDelayMs = 5_000,
    jitter = 0.2,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retryOn = [429, 500, 502, 503, 504],
  } = retryOptions

  let lastStatus: number | undefined
  let attempt = 0

  while (attempt <= retries) {
    try {
      const res = await fetchWithTimeout(url, options, timeoutMs)
      if (res.ok || !retryOn.includes(res.status)) return res
      lastStatus = res.status

      const retryAfter = res.headers.get('Retry-After')
      if (retryAfter) {
        const waitMs = parseInt(retryAfter, 10) * 1000
        if (!isNaN(waitMs)) {
          await sleep(Math.min(waitMs, maxDelayMs))
          attempt++
          continue
        }
      }
    } catch (err) {
      if (attempt >= retries) throw err
    }

    if (attempt < retries) {
      await sleep(jitteredDelay(baseDelayMs, attempt, jitter, maxDelayMs))
    }
    attempt++
  }

  throw new FetchRetryExhaustedError(url, retries + 1, lastStatus)
}

// ── createApiClient ────────────────────────────────────────────────────────

interface ApiClientOptions {
  baseUrl: string
  timeoutMs?: number
  retries?: number
  breaker?: CircuitBreaker
  defaultHeaders?: Record<string, string>
}

interface ApiClientRequest extends RequestInit {
  params?: Record<string, string | number | boolean>
}

export function createApiClient(opts: ApiClientOptions) {
  const {
    baseUrl,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = 2,
    breaker,
    defaultHeaders = {},
  } = opts

  async function request<T>(path: string, init: ApiClientRequest = {}): Promise<T> {
    const { params, headers: extra, ...rest } = init
    const url = buildUrl(baseUrl, path, params)

    const fetchFn = () =>
      fetchWithRetry(
        url.toString(),
        {
          ...rest,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...defaultHeaders,
            ...(extra as Record<string, string>),
          },
        },
        { retries, timeoutMs }
      ).then(async (res) => {
        const requestId = res.headers.get('x-request-id') ?? undefined
        if (!res.ok) {
          const data = await res.json().catch(() => null)
          const message =
            (data as { message?: string } | null)?.message || `API ${res.status} on ${path}`
          if (res.status >= 400 && res.status < 500) {
            throw new HttpClientError(res.status, message)
          }
          throw new ApiError(res.status, message, undefined, requestId)
        }
        return res.json() as Promise<T>
      })

    return breaker ? breaker.execute(fetchFn) : fetchFn()
  }

  return {
    get:    <T>(path: string, init?: ApiClientRequest) => request<T>(path, { ...init, method: 'GET' }),
    post:   <T>(path: string, body: unknown, init?: ApiClientRequest) =>
              request<T>(path, { ...init, method: 'POST', body: JSON.stringify(body) }),
    put:    <T>(path: string, body: unknown, init?: ApiClientRequest) =>
              request<T>(path, { ...init, method: 'PUT', body: JSON.stringify(body) }),
    patch:  <T>(path: string, body: unknown, init?: ApiClientRequest) =>
              request<T>(path, { ...init, method: 'PATCH', body: JSON.stringify(body) }),
    delete: <T>(path: string, init?: ApiClientRequest) => request<T>(path, { ...init, method: 'DELETE' }),
  }
}

// ── Default resilient backend client ───────────────────────────────────────

export const backendClient = createApiClient({
  baseUrl: getApiBaseUrl(),
  timeoutMs: DEFAULT_TIMEOUT_MS,
  retries: 2,
  breaker: backendApiBreaker,
})

// ── Backward-compatible helpers (same signatures, same base URL) ───────────

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => ({}) as { message?: string; code?: string })
    throw new ApiError(res.status, error.message || `HTTP ${res.status}`, error.code)
  }
  return res.json()
}

function jsonInit(method: string, body?: unknown, options?: RequestInit): RequestInit {
  return {
    ...options,
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  }
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
  options?: RequestInit
): Promise<T> {
  const url = buildUrl(getApiBaseUrl(), path, params)
  const res = await fetchWithTimeout(url.toString(), jsonInit('GET', undefined, options))
  return handleResponse<T>(res)
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const url = buildUrl(getApiBaseUrl(), path)
  const res = await fetchWithTimeout(url.toString(), jsonInit('POST', body))
  return handleResponse<T>(res)
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const url = buildUrl(getApiBaseUrl(), path)
  const res = await fetchWithTimeout(url.toString(), jsonInit('PUT', body))
  return handleResponse<T>(res)
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const url = buildUrl(getApiBaseUrl(), path)
  const res = await fetchWithTimeout(url.toString(), jsonInit('PATCH', body))
  return handleResponse<T>(res)
}

export async function apiDelete<T>(path: string): Promise<T> {
  const url = buildUrl(getApiBaseUrl(), path)
  const res = await fetchWithTimeout(url.toString(), jsonInit('DELETE'))
  return handleResponse<T>(res)
}
