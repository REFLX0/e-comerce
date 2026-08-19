'use client'

import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { usePathname, useRouter } from '@/i18n/routing'

/**
 * Keys that are read from the URL but are not "filters" for the purposes
 * of the active-filter count badge (badge shows how many real filters are set).
 */
const NON_FILTER_KEYS = new Set([
  'page',
  'q',
  'search',
  'sortBy',
  'make',
  'model',
  'engine',
  'vehicleType',
  'cylinders',
  'power',
  'fuelType',
])

export type FilterValue = string | null

/** Count how many real filters are set in a key→value map. */
export function countActiveFilters(
  values: Record<string, string>,
  keys: ReadonlySet<string> = NON_FILTER_KEYS
) {
  return Object.entries(values).filter(([key, value]) => value && !keys.has(key))
    .length
}

/**
 * URL-backed filter state.
 *
 * - Every mutation pushes a new URLSearchParams onto the *current* pathname
 *   (locale-aware) so filtered views are shareable, bookmarkable and survive
 *   the back button — on any page (catalogue, category, brand, search).
 * - `page` is always reset when a filter changes.
 * - List-style params (e.g. `brands`) are stored comma-separated.
 */
export function useFilterParams() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const params = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams]
  )

  const commit = useCallback(
    (next: URLSearchParams) => {
      const qs = next.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname)
    },
    [pathname, router]
  )

  /** Set or remove a single filter param. */
  const setFilter = useCallback(
    (key: string, value: FilterValue) => {
      const next = new URLSearchParams(searchParams.toString())
      if (value) next.set(key, value)
      else next.delete(key)
      next.delete('page')
      commit(next)
    },
    [commit, searchParams]
  )

  /** Apply several filter changes at once (e.g. multi-select, clear-all). */
  const patchFilters = useCallback(
    (patch: Record<string, FilterValue>) => {
      const next = new URLSearchParams(searchParams.toString())
      Object.entries(patch).forEach(([key, value]) => {
        if (value) next.set(key, value)
        else next.delete(key)
      })
      next.delete('page')
      commit(next)
    },
    [commit, searchParams]
  )

  /** Replace the whole query string (used by "apply" on mobile). */
  const replaceParams = useCallback(
    (next: URLSearchParams) => {
      next.delete('page')
      commit(next)
    },
    [commit]
  )

  const clearAll = useCallback(
    () => commit(new URLSearchParams()),
    [commit]
  )

  const activeCount = useMemo(() => {
    let count = 0
    searchParams.forEach((value, key) => {
      if (!NON_FILTER_KEYS.has(key) && value) count += 1
    })
    return count
  }, [searchParams])

  /** Read a comma-separated list param (e.g. `brands`). */
  const getList = useCallback(
    (key: string) =>
      (searchParams.get(key) || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    [searchParams]
  )

  return {
    params,
    commit,
    setFilter,
    patchFilters,
    replaceParams,
    clearAll,
    activeCount,
    getList,
    pathname,
  }
}