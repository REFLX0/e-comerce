/**
 * lib/api/client.ts — Resilient HTTP client for specpart
 *
 * All existing exports (apiGet, apiPost, apiPut, apiPatch, apiDelete) are
 * preserved with the same signatures for full backward compatibility.
 *
 * Added (SRE upgrades):
 *   - fetchWithTimeout  — hard timeout via AbortController (never hangs)
 *   - fetchWithRetry    — exponential backoff + ±20% jitter on 5xx errors
 *   - createApiClient   — factory combining timeout + retry + circuit breaker
 *   - All existing helpers now route through fetchWithTimeout (8s default)
 */

import {
  CircuitBreaker,
  HttpClientError,
  backendApiBreaker,
} from './circuit-breaker'

// Single source of truth for the backend base URL (see resolveBackendUrl):
// server (inside Docker) → http://nginx:8082/api, browser → /api via nginx proxy
const BASE_URL = resolveBackendUrl()
const DEFAULT_TIMEOUT_MS = 15_000

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

function getApiBaseUrl(baseUrl: string): string {
  if (/^https?:\/\//i.test(baseUrl)) return baseUrl.replace(/\/$/, '')

  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return `${origin.replace(/\/$/, '')}/${baseUrl.replace(/^\/|\/$/g, '')}`
}

function buildApiUrl(baseUrl: string, path: string): URL {
  const base = getApiBaseUrl(baseUrl)
  return new URL(`${base}/${path.replace(/^\//, '')}`)
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
    const url = buildApiUrl(baseUrl, path)
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null && v !== '' && v !== 'undefined') {
          url.searchParams.set(k, String(v))
        }
      }
    }

    const isFormData = rest.body instanceof FormData
    const headers: Record<string, string> = {
      ...defaultHeaders,
      ...(extra as Record<string, string>),
    }
    if (!isFormData && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'
    }
    const fetchFn = () =>
      fetchWithRetry(
        url.toString(),
        {
          ...rest,
          credentials: 'include',
          headers,
        },
        { retries, timeoutMs }
      ).then(async (res) => {
        const requestId = res.headers.get('x-request-id') ?? undefined
        if (!res.ok) {
          const data = await res.json().catch(() => null)
          if (res.status >= 400 && res.status < 500) {
            throw new HttpClientError(res.status, `API ${res.status} on ${path}`)
          }
          throw new ApiError(res.status, `API ${res.status} on ${path}`, undefined, requestId)
        }
        return res.json() as Promise<T>
      })

    return breaker ? breaker.execute(fetchFn) : fetchFn()
  }

  const toBody = (body: unknown) =>
    body instanceof FormData ? body : JSON.stringify(body)

  return {
    get:    <T>(path: string, init?: ApiClientRequest) => request<T>(path, { ...init, method: 'GET' }),
    post:   <T>(path: string, body: unknown, init?: ApiClientRequest) =>
              request<T>(path, { ...init, method: 'POST', body: toBody(body) }),
    put:    <T>(path: string, body: unknown, init?: ApiClientRequest) =>
              request<T>(path, { ...init, method: 'PUT', body: toBody(body) }),
    patch:  <T>(path: string, body: unknown, init?: ApiClientRequest) =>
              request<T>(path, { ...init, method: 'PATCH', body: toBody(body) }),
    delete: <T>(path: string, init?: ApiClientRequest) => request<T>(path, { ...init, method: 'DELETE' }),
  }
}

// ── Default resilient backend client ──────────────────────────────────────
function resolveBackendUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://nginx:8082/api'
  }
  return process.env.NEXT_PUBLIC_API_URL || '/api'
}

export const backendClient = createApiClient({
  baseUrl: resolveBackendUrl(),
  timeoutMs: DEFAULT_TIMEOUT_MS,
  retries: 2,
  breaker: backendApiBreaker,
})

// ── Backward-compatible helpers (existing API — now with timeout) ──────────

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Erreur réseau' }))
    throw new ApiError(res.status, error.message || 'Une erreur est survenue', error.code)
  }
  return res.json()
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
  options?: RequestInit
): Promise<T> {
  const origin = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    
  const url = new URL(`${BASE_URL}${path}`, origin)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, String(v))
      }
    })
  }
  const res = await fetchWithTimeout(url.toString(), {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  return handleResponse<T>(res)
}

export async function apiPost<T>(path: string, body: unknown, ): Promise<T> {
  const res = await fetchWithTimeout(`${BASE_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      
    },
    body: JSON.stringify(body),
  })
  return handleResponse<T>(res)
}

export async function apiPut<T>(path: string, body: unknown, ): Promise<T> {
  const res = await fetchWithTimeout(`${BASE_URL}${path}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      
    },
    body: JSON.stringify(body),
  })
  return handleResponse<T>(res)
}

export async function apiPatch<T>(path: string, body: unknown, ): Promise<T> {
  const res = await fetchWithTimeout(`${BASE_URL}${path}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      
    },
    body: JSON.stringify(body),
  })
  return handleResponse<T>(res)
}

export async function apiDelete<T>(path: string, ): Promise<T> {
  const res = await fetchWithTimeout(`${BASE_URL}${path}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      
    },
  })
  return handleResponse<T>(res)
}
