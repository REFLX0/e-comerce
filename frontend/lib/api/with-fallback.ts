/**
 * lib/api/with-fallback.ts — Graceful degradation utility
 *
 * If a non-essential operation fails (e.g., loading brand logos, product
 * recommendations, CMS content), use withFallback to return a safe default
 * instead of crashing the page.
 *
 * Principle: "Recommendations unavailable. Everything else works."
 * — from the SRE graceful degradation checklist.
 *
 * @example
 * // Instead of crashing if Cloudinary is down:
 * const logo = await withFallback(
 *   () => cloudinary.getAsset(brandId),
 *   null,  // fallback value
 *   { label: 'brand-logo', logWarning: true }
 * )
 */

import { logger } from '../logger'

export interface FallbackOptions {
  /** Label for logging (identifies which feature degraded) */
  label?: string
  /** Log a warning when the fallback is used. Default: true */
  logWarning?: boolean
  /**
   * Optional: stale cache getter. If provided and primary fails,
   * try the cache before returning the static fallback.
   */
  getStale?: () => Promise<unknown>
  /**
   * Optional: callback fired when fallback is used (e.g., to emit a metric)
   */
  onFallback?: (error: unknown) => void
}

/**
 * Execute `primary` and return its result.
 * If it throws or rejects, return `fallback` instead.
 *
 * Non-throwing — always resolves.
 */
export async function withFallback<T>(
  primary: () => Promise<T>,
  fallback: T,
  options: FallbackOptions = {}
): Promise<T> {
  const { label = 'unknown', logWarning = true, getStale, onFallback } = options

  try {
    return await primary()
  } catch (error) {
    if (logWarning) {
      logger.warn(`[withFallback] "${label}" degraded — using fallback`, {
        error: error instanceof Error
          ? { name: error.name, message: error.message }
          : { name: 'UnknownError', message: String(error) },
      })
    }

    onFallback?.(error)

    // Attempt stale cache before the static fallback
    if (getStale) {
      try {
        const stale = await getStale()
        if (stale !== null && stale !== undefined) {
          logger.info(`[withFallback] "${label}" — served stale cached data`)
          return stale as T
        }
      } catch {
        // Stale cache also failed — fall through to static fallback
      }
    }

    return fallback
  }
}

/**
 * Synchronous variant for non-async operations.
 */
export function withFallbackSync<T>(
  primary: () => T,
  fallback: T,
  options: Pick<FallbackOptions, 'label' | 'logWarning' | 'onFallback'> = {}
): T {
  const { label = 'unknown', logWarning = true, onFallback } = options
  try {
    return primary()
  } catch (error) {
    if (logWarning) {
      logger.warn(`[withFallbackSync] "${label}" degraded — using fallback`)
    }
    onFallback?.(error)
    return fallback
  }
}

/**
 * Race multiple providers — return the first to succeed.
 * Useful for multi-region or multi-CDN fallover.
 *
 * @example
 * const image = await withProviderFallback([
 *   () => cloudinary.getOptimized(id),
 *   () => s3.getPublic(id),
 *   () => Promise.resolve(PLACEHOLDER_URL),
 * ])
 */
export async function withProviderFallback<T>(
  providers: Array<() => Promise<T>>,
  options: FallbackOptions = {}
): Promise<T> {
  const { label = 'multi-provider', logWarning = true } = options

  for (let i = 0; i < providers.length; i++) {
    try {
      const provider = providers[i];
      if (provider) return await provider();
    } catch (error) {
      if (logWarning && i < providers.length - 1) {
        logger.warn(`[withProviderFallback] "${label}" provider ${i + 1} failed — trying next`)
      }
    }
  }

  throw new Error(`[withProviderFallback] All ${providers.length} providers failed for "${label}"`)
}

