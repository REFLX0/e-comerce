/**
 * lib/logger.ts — Structured JSON logger for specpart
 *
 * Principles (from the SRE checklist):
 *  - Every event includes: timestamp, level, requestId, message, meta
 *  - NEVER logs: passwords, tokens, secrets, payment details
 *  - JSON in production (queryable by log aggregators)
 *  - Human-readable in development
 *  - Severity levels: debug < info < warn < error < fatal
 */

import 'server-only'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export interface LogEntry {
  level: LogLevel
  timestamp: string
  requestId?: string
  userId?: string
  endpoint?: string
  method?: string
  statusCode?: number
  durationMs?: number
  message: string
  error?: {
    name: string
    message: string
    stack?: string
    digest?: string
  }
  [key: string]: unknown
}

// ── Fields that must NEVER appear in logs ─────────────────────────────────
const SENSITIVE_KEYS = new Set([
  'password',
  'passwordHash',
  'token',
  'accessToken',
  'refreshToken',
  'secret',
  'apiKey',
  'api_key',
  'authorization',
  'cookie',
  'sessionToken',
  'cardNumber',
  'cvv',
  'cvc',
  'pin',
  'ssn',
  'creditCard',
  'bankAccount',
])

/**
 * Recursively strip sensitive keys from any object before logging.
 * Replaces values with `[REDACTED]`.
 */
export function sanitizeForLog<T>(obj: T, depth = 0): T {
  if (depth > 5 || obj === null || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForLog(item, depth + 1)) as unknown as T
  }
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      result[key] = '[REDACTED]'
    } else {
      result[key] = sanitizeForLog(value, depth + 1)
    }
  }
  return result as T
}

// ── Level hierarchy ────────────────────────────────────────────────────────
const LEVEL_NUM: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
}

const MIN_LEVEL: LogLevel =
  process.env.NODE_ENV === 'production' ? 'info' : 'debug'

// ── ANSI colours for development ──────────────────────────────────────────
const DEV_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[90m',   // grey
  info:  '\x1b[36m',   // cyan
  warn:  '\x1b[33m',   // yellow
  error: '\x1b[31m',   // red
  fatal: '\x1b[35m',   // magenta
}
const RESET = '\x1b[0m'

function shouldLog(level: LogLevel): boolean {
  return LEVEL_NUM[level] >= LEVEL_NUM[MIN_LEVEL]
}

function write(entry: LogEntry): void {
  if (!shouldLog(entry.level)) return

  const sanitized = sanitizeForLog(entry)

  if (process.env.NODE_ENV === 'production') {
    // JSON — structured for log aggregators (Datadog, CloudWatch, Grafana Loki…)
    process.stdout.write(JSON.stringify(sanitized) + '\n')
  } else {
    // Pretty print for local development
    const color = DEV_COLORS[entry.level]
    const prefix = `${color}[${entry.level.toUpperCase()}]${RESET}`
    const ts = new Date(entry.timestamp).toLocaleTimeString()
    const rid = entry.requestId ? ` (req:${entry.requestId.slice(0, 8)})` : ''
    const dur = entry.durationMs != null ? ` ${entry.durationMs}ms` : ''
    const base = `${ts} ${prefix}${rid}${dur} ${entry.message}`

    if (entry.error) {
      console.error(base, '\n', entry.error.stack ?? entry.error.message)
    } else if (entry.level === 'warn' || entry.level === 'error' || entry.level === 'fatal') {
      console.error(base)
    } else {
      console.log(base)
    }
  }
}

// ── Logger factory ─────────────────────────────────────────────────────────
function createEntry(
  level: LogLevel,
  message: string,
  meta: Partial<LogEntry> = {}
): LogEntry {
  return {
    level,
    timestamp: new Date().toISOString(),
    message,
    ...meta,
  }
}

export const logger = {
  debug: (message: string, meta?: Partial<LogEntry>) =>
    write(createEntry('debug', message, meta)),

  info: (message: string, meta?: Partial<LogEntry>) =>
    write(createEntry('info', message, meta)),

  warn: (message: string, meta?: Partial<LogEntry>) =>
    write(createEntry('warn', message, meta)),

  error: (message: string, error?: unknown, meta?: Partial<LogEntry>) => {
    const err =
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : error != null
        ? { name: 'UnknownError', message: String(error) }
        : undefined
    write(createEntry('error', message, { ...meta, error: err }))
  },

  fatal: (message: string, error?: unknown, meta?: Partial<LogEntry>) => {
    const err =
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : error != null
        ? { name: 'UnknownError', message: String(error) }
        : undefined
    write(createEntry('fatal', message, { ...meta, error: err }))
  },

  /** Create a child logger pre-bound with context (requestId, userId, etc.) */
  child(context: Partial<LogEntry>) {
    return {
      debug: (msg: string, meta?: Partial<LogEntry>) =>
        write(createEntry('debug', msg, { ...context, ...meta })),
      info: (msg: string, meta?: Partial<LogEntry>) =>
        write(createEntry('info', msg, { ...context, ...meta })),
      warn: (msg: string, meta?: Partial<LogEntry>) =>
        write(createEntry('warn', msg, { ...context, ...meta })),
      error: (msg: string, error?: unknown, meta?: Partial<LogEntry>) => {
        const err =
          error instanceof Error
            ? { name: error.name, message: error.message, stack: error.stack }
            : error != null
            ? { name: 'UnknownError', message: String(error) }
            : undefined
        write(createEntry('error', msg, { ...context, ...meta, error: err }))
      },
    }
  },
}

export default logger

