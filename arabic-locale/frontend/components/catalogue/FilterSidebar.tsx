'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/lib/api/categories'
import { productsApi } from '@/lib/api/products'
import { useSearchParams } from 'next/navigation'
import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion'
import { FilterSidebarSkeleton } from '../common/Skeleton'
import { FilterSection } from './filters/FilterSection'
import { BrandFilter } from './filters/BrandFilter'
import { PriceFilter, type PriceRangeValue } from './filters/PriceFilter'
import { ViscosityFilter } from './filters/ViscosityFilter'
import { Check, RotateCcw, SlidersHorizontal } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  useFilterParams,
  countActiveFilters,
  type FilterValue,
} from '@/lib/hooks/useFilterParams'
import type { FacetBrand } from '@/lib/types'
import { cn } from '@/lib/utils'

const OIL_TYPES = ['100% Synthèse', 'Semi-Synthèse', 'Minérale']
const API_STANDARDS = ['API SL', 'API SM', 'API SN', 'API SP', 'API CF', 'API CI-4', 'API CJ-4', 'API CK-4']
const ACEA_STANDARDS = ['ACEA A3/B4', 'ACEA C2', 'ACEA C3', 'ACEA C4', 'ACEA C5', 'ACEA E4', 'ACEA E6', 'ACEA E7', 'ACEA E9']

/** Every accordion section — all open by default; state persists while mounted. */
const DEFAULT_OPEN_SECTIONS = ['brands', 'budget', 'viscosity', 'packaging', 'oil-type', 'api', 'acea', 'availability']

function uniqueCategories<T extends { name: string }>(categories: T[]) {
  const names = new Set<string>()
  return categories.filter((category) => {
    const name = category.name.trim().toLocaleLowerCase()
    if (names.has(name)) return false
    names.add(name)
    return true
  })
}

function isPackagingVolume(value: string) {
  return /^\d+(?:[.,]\d+)?\s*(?:l|ml)$/i.test(value.trim())
}

interface FilterSidebarProps {
  /** `instant` pushes to the URL per change; `draft` collects into `draft` until Apply. */
  mode?: 'instant' | 'draft'
  draft?: Record<string, string>
  onDraftChange?: (patch: Record<string, string | null>) => void
  /** Hide the category nav (used on category/brand/search pages which have a fixed context). */
  hideCategories?: boolean
  /** Hide the brands section (used on brand pages which have a fixed brand context). */
  hideBrands?: boolean
}

export function FilterSidebar({
  mode = 'instant',
  draft,
  onDraftChange,
  hideCategories = false,
  hideBrands = false,
}: FilterSidebarProps) {
  const t = useTranslations('Catalogue')
  const searchParams = useSearchParams()
  const filterParams = useFilterParams()

  const inDraft = mode === 'draft'
  const read = (key: string) =>
    inDraft ? draft?.[key] ?? null : searchParams.get(key)
  const readNumber = (key: string) => {
    const value = read(key)
    if (!value) return undefined
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  const patch = (updates: Record<string, FilterValue>) => {
    if (inDraft) onDraftChange?.(updates)
    else filterParams.patchFilters(updates)
  }

  const selectedBrands = useMemo(
    () =>
      (read('brands') || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inDraft, draft?.brands, searchParams]
  )

  const facetFilters = useMemo(() => {
    const brands = (searchParams.get('brands') || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
    const parsePrice = (key: string) => {
      const raw = searchParams.get(key)
      if (!raw) return undefined
      const parsed = Number(raw)
      return Number.isFinite(parsed) ? parsed : undefined
    }
    return {
      categorySlug: searchParams.get('categorySlug') || undefined,
      brands: brands.length ? brands.join(',') : undefined,
      viscosity: searchParams.get('viscosity') || undefined,
      inStockOnly: searchParams.get('inStockOnly') === 'true' || undefined,
      search: searchParams.get('search') || undefined,
      priceMin: parsePrice('priceMin'),
      priceMax: parsePrice('priceMax'),
    }
  }, [searchParams])

  const { data: categories, isLoading: catLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  })

  const { data: facets, isLoading: facetsLoading } = useQuery({
    queryKey: ['facets', facetFilters],
    queryFn: () => productsApi.getFacets(facetFilters),
  })

  const activeCount = inDraft
    ? countActiveFilters(draft ?? {})
    : filterParams.activeCount

  const clearAll = () => {
    if (inDraft) onDraftChange?.(Object.keys(draft ?? {}).reduce((acc, key) => ({ ...acc, [key]: null }), {}))
    else filterParams.clearAll()
  }

  if (catLoading || facetsLoading) return <FilterSidebarSkeleton />

  const priceBounds = facets?.priceRange ?? { min: 0, max: 5000 }
  const priceValue: PriceRangeValue = {
    min: readNumber('priceMin'),
    max: readNumber('priceMax'),
  }
  const priceCount =
    (priceValue.min !== undefined ? 1 : 0) + (priceValue.max !== undefined ? 1 : 0)

  const availabilityCount = [
    'inStockOnly',
    'isNew',
    'isFeatured',
  ].filter((key) => read(key) === 'true').length

  const toggleSingle = (key: string, value: string) =>
    patch({ [key]: read(key) === value ? null : value })

  return (
    <div className="overflow-hidden border border-black/10 bg-white shadow-[0_18px_45px_rgba(11,11,12,0.07)]">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center bg-[#0B0B0C] text-white">
            <SlidersHorizontal size={15} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.16em] text-[#111]">
              {t('filters')}
            </h2>
            {activeCount > 0 && (
              <p className="mt-0.5 text-[11px] font-medium text-neutral-500">
                {t('filtersActive', { count: activeCount })}
              </p>
            )}
          </div>
        </div>
        {!inDraft && activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#E10600] outline-none transition-colors hover:text-[#ab0500] focus-visible:ring-2 focus-visible:ring-[#E10600]/30"
          >
            <RotateCcw size={13} aria-hidden="true" />
            {t('clearAllFilters')}
          </button>
        )}
      </div>

      <div className="space-y-6 p-5">
        {/* ── Categories ───────────────────────────────────────────────── */}
        {!hideCategories && (
          <section aria-label={t('categories')}>
            <h3 className="mb-3 text-[11px] font-black uppercase tracking-[0.16em] text-neutral-500">
              {t('categories')}
            </h3>
            <div className="space-y-1">
              <CategoryChoice
                label={t('allCategories')}
                active={!read('categorySlug')}
                onClick={() => patch({ categorySlug: null })}
              />
              {uniqueCategories(
                (categories ?? []).filter((category) => category.productCount > 0)
              )
                .slice(0, 10)
                .flatMap((category) => [
                  <CategoryChoice
                    key={category.id}
                    label={category.name}
                    count={category.productCount}
                    active={read('categorySlug') === category.slug}
                    onClick={() => patch({ categorySlug: category.slug })}
                  />,
                  ...(read('categorySlug') === category.slug
                    ? uniqueCategories(category.children ?? [])
                        .filter((child) => child.productCount > 0)
                        .map((child) => (
                          <CategoryChoice
                            key={child.id}
                            label={child.name}
                            count={child.productCount}
                            active={read('categorySlug') === child.slug}
                            onClick={() => patch({ categorySlug: child.slug })}
                            nested
                          />
                        ))
                    : []),
                ])}
            </div>
          </section>
        )}

        {/* ── Accordion sections ───────────────────────────────────────── */}
        <AccordionPrimitive.Root
          defaultValue={DEFAULT_OPEN_SECTIONS}
          multiple
          className="flex w-full flex-col"
        >
          {/* Brands */}
          {!hideBrands && (
            <FilterSection
              value="brands"
              title={t('brands')}
              activeCount={selectedBrands.length}
              onClear={() => patch({ brands: null })}
            >
              <BrandFilter
                brands={(facets?.brands ?? []) as FacetBrand[]}
                selected={selectedBrands}
                onChange={(slugs) =>
                  patch({ brands: slugs.length ? slugs.join(',') : null })
                }
              />
            </FilterSection>
          )}

          {/* Budget */}
          <FilterSection
            value="budget"
            title={t('price')}
            activeCount={priceCount}
            onClear={() => patch({ priceMin: null, priceMax: null })}
          >
            <PriceFilter
              bounds={priceBounds}
              value={priceValue}
              onChange={(value) =>
                patch({
                  priceMin: value.min !== undefined ? String(value.min) : null,
                  priceMax: value.max !== undefined ? String(value.max) : null,
                })
              }
            />
          </FilterSection>

          {/* Viscosity */}
          <FilterSection
            value="viscosity"
            title={t('viscosity')}
            activeCount={read('viscosity') ? 1 : 0}
            onClear={() => patch({ viscosity: null })}
          >
            <ViscosityFilter
              viscosities={facets?.viscosities ?? []}
              selected={read('viscosity') || undefined}
              onChange={(value) => patch({ viscosity: value })}
            />
          </FilterSection>

          {/* Packaging */}
          {(facets?.volumes?.length ?? 0) > 0 && (
            <FilterSection
              value="packaging"
              title={t('packaging')}
              activeCount={read('volume') ? 1 : 0}
              onClear={() => patch({ volume: null })}
            >
              <div className="flex flex-wrap gap-1.5">
                {facets!.volumes
                  .filter((volume) => isPackagingVolume(volume.volume))
                  .sort(
                    (first, second) =>
                      second.count - first.count ||
                      first.volume.localeCompare(second.volume)
                  )
                  .slice(0, 16)
                  .map((volume) => {
                    const isActive = read('volume') === volume.volume
                    return (
                      <button
                        key={volume.volume}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => toggleSingle('volume', volume.volume)}
                        className={cn(
                          'inline-flex min-h-8 items-center gap-1 border px-2.5 text-[10px] font-black tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E10600]/30',
                          isActive
                            ? 'border-[#E10600] bg-[#E10600] text-white'
                            : 'border-black/10 bg-white text-[#111] hover:border-black/35'
                        )}
                      >
                        {volume.volume}
                        <span
                          className={cn(
                            isActive ? 'text-white/70' : 'text-neutral-400'
                          )}
                        >
                          {volume.count}
                        </span>
                      </button>
                    )
                  })}
              </div>
            </FilterSection>
          )}

          {/* Oil type / API / ACEA */}
          <FilterSection
            value="oil-type"
            title={t('oilType')}
            activeCount={read('type') ? 1 : 0}
            onClear={() => patch({ type: null })}
          >
            <div className="space-y-2.5">
              {OIL_TYPES.map((type) => (
                <ToggleRow
                  key={type}
                  label={type}
                  checked={read('type') === type}
                  onChange={(checked) =>
                    patch({ type: checked ? type : null })
                  }
                />
              ))}
            </div>
          </FilterSection>

          <FilterSection
            value="api"
            title={t('apiStandards')}
            activeCount={read('api') ? 1 : 0}
            onClear={() => patch({ api: null })}
          >
            <div className="space-y-2.5">
              {API_STANDARDS.map((standard) => (
                <ToggleRow
                  key={standard}
                  label={standard}
                  checked={read('api') === standard}
                  onChange={(checked) =>
                    patch({ api: checked ? standard : null })
                  }
                />
              ))}
            </div>
          </FilterSection>

          <FilterSection
            value="acea"
            title={t('aceaStandards')}
            activeCount={read('acea') ? 1 : 0}
            onClear={() => patch({ acea: null })}
          >
            <div className="space-y-2.5">
              {ACEA_STANDARDS.map((standard) => (
                <ToggleRow
                  key={standard}
                  label={standard}
                  checked={read('acea') === standard}
                  onChange={(checked) =>
                    patch({ acea: checked ? standard : null })
                  }
                />
              ))}
            </div>
          </FilterSection>

          {/* Availability */}
          <FilterSection
            value="availability"
            title={t('availability')}
            activeCount={availabilityCount}
            onClear={() =>
              patch({ inStockOnly: null, isNew: null, isFeatured: null })
            }
          >
            <div className="space-y-2.5">
              <ToggleRow
                label={t('inStockOnly')}
                checked={read('inStockOnly') === 'true'}
                onChange={(checked) =>
                  patch({ inStockOnly: checked ? 'true' : null })
                }
              />
              <ToggleRow
                label={t('newArrivals')}
                checked={read('isNew') === 'true'}
                onChange={(checked) =>
                  patch({ isNew: checked ? 'true' : null })
                }
              />
              <ToggleRow
                label={t('featuredProducts')}
                checked={read('isFeatured') === 'true'}
                onChange={(checked) =>
                  patch({ isFeatured: checked ? 'true' : null })
                }
              />
            </div>
          </FilterSection>
        </AccordionPrimitive.Root>
      </div>
    </div>
  )
}

/* ── Small building blocks ───────────────────────────────────────────────── */

function CategoryChoice({
  label,
  count,
  active,
  onClick,
  nested = false,
}: {
  label: string
  count?: number
  active: boolean
  onClick: () => void
  nested?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex min-h-9 w-full items-center justify-between gap-3 border-s-2 px-3 text-start text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E10600]/30 ${
        nested ? 'ps-7 text-[13px]' : ''
      } ${
        active
          ? 'border-[#E10600] bg-[#E10600]/[0.06] font-bold text-[#111]'
          : 'border-transparent text-neutral-600 hover:border-black/25 hover:bg-neutral-50 hover:text-[#111]'
      }`}
    >
      <span className="truncate">{label}</span>
      {typeof count === 'number' && (
        <span className="text-[11px] text-neutral-400">{count}</span>
      )}
    </button>
  )
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="group flex min-h-8 cursor-pointer items-center gap-2.5 py-0.5">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span
        aria-hidden="true"
        className={cn(
          'flex h-4 w-4 shrink-0 items-center justify-center border transition-colors',
          checked
            ? 'border-[#E10600] bg-[#E10600] text-white'
            : 'border-black/20 bg-white group-hover:border-[#E10600]/60'
        )}
      >
        <Check
          size={11}
          strokeWidth={3.5}
          className={cn(
            'transition-transform duration-150',
            checked ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          )}
        />
      </span>
      <span
        className={cn(
          'text-[13px]',
          checked
            ? 'font-bold text-[#111]'
            : 'text-neutral-600 group-hover:text-[#111]'
        )}
      >
        {label}
      </span>
    </label>
  )
}