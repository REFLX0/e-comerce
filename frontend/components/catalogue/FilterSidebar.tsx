'use client'

import { useMemo, useRef, useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
import {
  Bike,
  Car,
  Check,
  ChevronRight,
  Package,
  RotateCcw,
  ShipWheel,
  SlidersHorizontal,
  Wrench,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  useFilterParams,
  countActiveFilters,
  type FilterValue,
} from '@/lib/hooks/useFilterParams'
import { NAVIGATION_TAXONOMY } from '@/lib/navigation/taxonomy'
import type { Category, FacetBrand } from '@/lib/types'
import { cn } from '@/lib/utils'

const NAVIGATION_ICONS: Record<string, React.ElementType> = {
  automobile: Car,
  'auto-pieces-rechange': Wrench,
  'moto-karting': Bike,
  marine: ShipWheel,
}

const OIL_TYPES = ['100% Synthèse', 'Semi-Synthèse', 'Minérale']
const API_STANDARDS = ['API SL', 'API SM', 'API SN', 'API SP', 'API CF', 'API CI-4', 'API CJ-4', 'API CK-4']
const ACEA_STANDARDS = ['ACEA A3/B4', 'ACEA C2', 'ACEA C3', 'ACEA C4', 'ACEA C5', 'ACEA E4', 'ACEA E6', 'ACEA E7', 'ACEA E9']

/** Every accordion section — all open by default; state persists while mounted. */
const DEFAULT_OPEN_SECTIONS = ['brands', 'budget', 'viscosity', 'packaging', 'oil-type', 'api', 'acea', 'availability']

function isPackagingVolume(value: string) {
  return /^\d+(?:[.,]\d+)?\s*(?:l|ml)$/i.test(value.trim())
}

function findNode(categories: Category[] | undefined, slug: string): Category | undefined {
  if (!categories) return undefined
  for (const cat of categories) {
    if (cat.slug === slug) return cat
    if (cat.children?.length) {
      const found = findNode(cat.children, slug)
      if (found) return found
    }
  }
  return undefined
}

export interface SubcategoryOption {
  id?: string | number
  name: string
  slug: string
  productCount?: number
  children?: SubcategoryOption[]
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
  /** Base filters to apply to the facets query (e.g. { brandSlug: slug } on brand pages) */
  baseFilters?: Record<string, any>
}

export function FilterSidebar({
  mode = 'instant',
  draft,
  onDraftChange,
  hideCategories = false,
  hideBrands = false,
  baseFilters = {},
}: FilterSidebarProps) {
  const t = useTranslations('Catalogue')
  const tTax = useTranslations('Taxonomy')
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
      ...baseFilters,
    }
  }, [searchParams, baseFilters])

  const { data: categoriesTree, isLoading: catLoading } = useQuery({
    queryKey: ['categories-tree'],
    queryFn: categoriesApi.getTree,
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

  // Build the list of categories with resolved taxonomy subcategories
  const resolvedCategories = useMemo(() => {
    return NAVIGATION_TAXONOMY.map((item) => {
      const dbNode = findNode(categoriesTree, item.slug)
      const label = item.labelKey ? tTax(item.labelKey) : (dbNode?.name ?? item.label ?? item.slug)
      const Icon = NAVIGATION_ICONS[item.slug] ?? Package

      const subcategories: SubcategoryOption[] = (item.children ?? []).map((child) => {
        const childDbNode = findNode(categoriesTree, child.slug)
        const childLabel = child.labelKey ? tTax(child.labelKey) : (childDbNode?.name ?? child.label ?? child.slug)

        const subSubcategories: SubcategoryOption[] = (child.children ?? []).map((subChild) => {
          const subChildDbNode = findNode(categoriesTree, subChild.slug)
          const subChildLabel = subChild.labelKey ? tTax(subChild.labelKey) : (subChildDbNode?.name ?? subChild.label ?? subChild.slug)
          
          const count = facets?.categoryCounts
             ? facets.categoryCounts.find(c => c.id === subChildDbNode?.id)?.count ?? 0
             : subChildDbNode?.productCount

          return {
            id: subChildDbNode?.id ?? subChild.slug,
            name: subChildLabel,
            slug: subChild.slug,
            productCount: count,
          }
        })

        const childCount = facets?.categoryCounts
          ? subSubcategories.reduce((acc, sub) => acc + (sub.productCount ?? 0), 
               facets.categoryCounts.find(c => c.id === childDbNode?.id)?.count ?? 0)
          : childDbNode?.productCount

        return {
          id: childDbNode?.id ?? child.slug,
          name: childLabel,
          slug: child.slug,
          productCount: childCount,
          children: subSubcategories.length ? subSubcategories : undefined,
        }
      })

      const rootCount = facets?.categoryCounts
        ? subcategories.reduce((acc, sub) => acc + (sub.productCount ?? 0), 
             facets.categoryCounts.find(c => c.id === dbNode?.id)?.count ?? 0)
        : dbNode?.productCount

      return {
        id: dbNode?.id ?? item.slug,
        slug: item.slug,
        label,
        Icon,
        count: rootCount,
        subcategories,
      }
    })
  }, [categoriesTree, tTax, facets?.categoryCounts])

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

  const currentCategorySlug = read('categorySlug')

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#16254c] to-[#0a1128] shadow-2xl backdrop-blur-xl">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-white/10 text-white shadow-inner">
            <SlidersHorizontal size={16} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.16em] text-[#D4A76A]">
              {t('filters')}
            </h2>
            {activeCount > 0 && (
              <p className="mt-0.5 text-[11px] font-medium text-white/60">
                {t('filtersActive', { count: activeCount })}
              </p>
            )}
          </div>
        </div>
        {!inDraft && activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#D4A76A] outline-none transition-all hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#D4A76A]/30"
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
            <h3 className="mb-4 pl-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#D4A76A]/80">
              {t('categories')}
            </h3>
            <div className="space-y-1.5">
              {/* All categories button */}
              <button
                type="button"
                onClick={() => patch({ categorySlug: null })}
                aria-pressed={!currentCategorySlug}
                className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-xl px-4 text-start text-[13px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A76A]/30 ${
                  !currentCategorySlug
                    ? 'border border-white/10 bg-white/10 font-bold text-white shadow-inner'
                    : 'border border-transparent text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>{t('allCategories')}</span>
              </button>

              {/* Taxonomy categories with hover flyout */}
              {resolvedCategories.map((cat) => (
                <CategoryWithFlyout
                  key={cat.slug}
                  slug={cat.slug}
                  label={cat.label}
                  Icon={cat.Icon}
                  count={cat.count}
                  active={currentCategorySlug === cat.slug}
                  onClick={() => patch({ categorySlug: cat.slug })}
                  subcategories={cat.subcategories}
                  activeChildSlug={currentCategorySlug}
                  onChildClick={(slug) => patch({ categorySlug: slug })}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Accordion sections ───────────────────────────────────────── */}
        <AccordionPrimitive.Root
          defaultValue={DEFAULT_OPEN_SECTIONS}
          multiple
          className="flex w-full flex-col gap-1"
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
              <div className="flex flex-wrap gap-2">
                {facets!.volumes
                  .filter((volume) => isPackagingVolume(volume.volume))
                  .sort(
                    (first, second) =>
                      second.count - first.count ||
                      first.volume.localeCompare(second.volume)
                  )
                  .slice(0, 16)
                  .map((volume) => {
                    const active = read('volume') === volume.volume
                    return (
                      <button
                        key={volume.volume}
                        type="button"
                        onClick={() => toggleSingle('volume', volume.volume)}
                        aria-pressed={active}
                        className={cn(
                          'rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A76A]/40',
                          active
                            ? 'border-[#D4A76A] bg-[#D4A76A] font-bold text-[#16254c] shadow-[0_0_15px_rgba(212,167,106,0.3)]'
                            : 'border-white/10 bg-white/5 text-white/80 hover:border-white/20 hover:bg-white/10 hover:text-white'
                        )}
                      >
                        {volume.volume}
                        <span
                          className={cn(
                            'ml-1.5 text-[10px]',
                            active ? 'text-[#16254c]/70' : 'text-white/40'
                          )}
                        >
                          ({volume.count})
                        </span>
                      </button>
                    )
                  })}
              </div>
            </FilterSection>
          )}

          {/* Oil Type */}
          <FilterSection
            value="oil-type"
            title={t('oilType')}
            activeCount={read('type') ? 1 : 0}
            onClear={() => patch({ type: null })}
          >
            <div className="space-y-1">
              {OIL_TYPES.map((type) => (
                <ToggleRow
                  key={type}
                  label={type}
                  checked={read('type') === type}
                  onChange={(checked) => patch({ type: checked ? type : null })}
                />
              ))}
            </div>
          </FilterSection>

          {/* API Standards */}
          <FilterSection
            value="api"
            title={t('standardsApi')}
            activeCount={read('api') ? 1 : 0}
            onClear={() => patch({ api: null })}
          >
            <div className="flex flex-wrap gap-2">
              {API_STANDARDS.map((api) => {
                const active = read('api') === api
                return (
                  <button
                    key={api}
                    type="button"
                    onClick={() => toggleSingle('api', api)}
                    aria-pressed={active}
                    className={cn(
                      'rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A76A]/40',
                      active
                        ? 'border-[#D4A76A] bg-[#D4A76A] font-bold text-[#16254c] shadow-[0_0_15px_rgba(212,167,106,0.3)]'
                        : 'border-white/10 bg-white/5 text-white/80 hover:border-white/20 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    {api}
                  </button>
                )
              })}
            </div>
          </FilterSection>

          {/* ACEA Standards */}
          <FilterSection
            value="acea"
            title={t('standardsAcea')}
            activeCount={read('acea') ? 1 : 0}
            onClear={() => patch({ acea: null })}
          >
            <div className="flex flex-wrap gap-2">
              {ACEA_STANDARDS.map((acea) => {
                const active = read('acea') === acea
                return (
                  <button
                    key={acea}
                    type="button"
                    onClick={() => toggleSingle('acea', acea)}
                    aria-pressed={active}
                    className={cn(
                      'rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A76A]/40',
                      active
                        ? 'border-[#D4A76A] bg-[#D4A76A] font-bold text-[#16254c] shadow-[0_0_15px_rgba(212,167,106,0.3)]'
                        : 'border-white/10 bg-white/5 text-white/80 hover:border-white/20 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    {acea}
                  </button>
                )
              })}
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
            <div className="space-y-1">
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
                onChange={(checked) => patch({ isNew: checked ? 'true' : null })}
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

/**
 * A category row with hover flyout subcategory panel
 */
function CategoryWithFlyout({
  slug,
  label,
  Icon,
  count,
  active,
  onClick,
  subcategories,
  activeChildSlug,
  onChildClick,
}: {
  slug: string
  label: string
  Icon: React.ElementType
  count?: number
  active: boolean
  onClick: () => void
  subcategories: SubcategoryOption[]
  activeChildSlug: string | null
  onChildClick: (slug: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [flyoutPos, setFlyoutPos] = useState<{ top: number; left: number } | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rowRef = useRef<HTMLDivElement>(null)
  const hasSubs = subcategories.length > 0

  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if any subcategory or nested subcategory is currently selected
  const hasActiveSub = useMemo(() => {
    if (!activeChildSlug) return false
    return subcategories.some((sub) => {
      if (sub.slug === activeChildSlug) return true
      return sub.children?.some((child) => child.slug === activeChildSlug)
    })
  }, [subcategories, activeChildSlug])

  const isHighlighted = active || hasActiveSub

  const openFlyout = useCallback(() => {
    if (!hasSubs) return
    if (closeTimer.current) clearTimeout(closeTimer.current)
    if (rowRef.current) {
      const rect = rowRef.current.getBoundingClientRect()
      setFlyoutPos({ top: Math.max(12, rect.top), left: rect.right + 6 })
    }
    setIsOpen(true)
  }, [hasSubs])

  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setIsOpen(false), 220)
  }, [])

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }, [])

  // Close when window scrolls to keep clean UI
  useEffect(() => {
    if (!isOpen) return
    const onScroll = () => setIsOpen(false)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isOpen])

  return (
    <div
      ref={rowRef}
      className="relative"
      onMouseEnter={openFlyout}
      onMouseLeave={scheduleClose}
    >
      {/* The main category row button */}
      <button
        type="button"
        onClick={onClick}
        aria-pressed={isHighlighted}
        aria-haspopup={hasSubs ? 'menu' : undefined}
        aria-expanded={hasSubs ? isOpen : undefined}
        className={`flex min-h-10 w-full items-center justify-between gap-2.5 rounded-xl px-3.5 text-start text-[13px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A76A]/40 ${
          isHighlighted
            ? 'border border-[#D4A76A]/40 bg-white/10 font-bold text-white shadow-inner'
            : 'border border-transparent text-white/75 hover:border-white/10 hover:bg-white/5 hover:text-white'
        }`}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <Icon
            size={15}
            className={cn(
              'shrink-0 transition-colors',
              isHighlighted ? 'text-[#D4A76A]' : 'text-white/40'
            )}
          />
          <span className="truncate">{label}</span>
        </span>

        <span className="flex shrink-0 items-center gap-1.5">
          {typeof count === 'number' && (
            <span className={cn('text-[11px] font-semibold', isHighlighted ? 'text-[#D4A76A]' : 'text-white/35')}>
              {count}
            </span>
          )}
          {hasSubs && (
            <ChevronRight
              size={13}
              className={cn(
                'transition-all duration-200',
                isOpen ? 'translate-x-0.5 text-[#D4A76A]' : 'text-white/30'
              )}
            />
          )}
        </span>
      </button>

      {/* Flyout Subcategories Panel rendered via React Portal directly into body */}
      {mounted && isOpen && hasSubs && flyoutPos && typeof document !== 'undefined' && createPortal(
        <div
          role="menu"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          className="fixed z-[99999] overflow-hidden rounded-2xl border border-[#D4A76A]/35 shadow-2xl backdrop-blur-2xl"
          style={{
            top: flyoutPos.top,
            left: flyoutPos.left,
            minWidth: 250,
            maxWidth: 320,
            background: 'linear-gradient(145deg, #16254c 0%, #0a1128 100%)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 30px rgba(212,167,106,0.12)',
            animation: 'flyoutIn 0.16s cubic-bezier(0.16,1,0.3,1) both',
          }}
        >
          {/* Invisible hit-bridge on the left so moving cursor across gap never drops hover */}
          <div
            className="pointer-events-auto absolute -left-3 bottom-0 top-0 w-3 bg-transparent"
            aria-hidden="true"
          />

          {/* Header */}
          <div
            className="flex items-center justify-between border-b border-white/10 px-4 py-3"
            style={{ background: 'rgba(212,167,106,0.08)' }}
          >
            <div className="flex items-center gap-2">
              <Icon size={14} className="text-[#D4A76A]" />
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[#D4A76A]">
                {label}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClick()
                setIsOpen(false)
              }}
              className="text-[10px] font-bold uppercase tracking-wider text-white/50 transition-colors hover:text-[#D4A76A]"
            >
              Tous
            </button>
          </div>

          {/* List */}
          <ul className="max-h-[380px] overflow-y-auto py-1.5">
            {subcategories.map((sub) => {
              const isSubActive = activeChildSlug === sub.slug
              const hasSubChildren = (sub.children?.length ?? 0) > 0

              return (
                <li key={sub.slug} role="none" className="px-1.5 py-0.5">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onChildClick(sub.slug)
                      setIsOpen(false)
                    }}
                    className={cn(
                      'group flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-start text-[13px] transition-all duration-150',
                      isSubActive
                        ? 'bg-[#D4A76A]/15 font-bold text-[#D4A76A] shadow-inner'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className={cn(
                          'h-1.5 w-1.5 shrink-0 rounded-full transition-colors',
                          isSubActive
                            ? 'bg-[#D4A76A] shadow-[0_0_8px_#D4A76A]'
                            : 'bg-white/30 group-hover:bg-[#D4A76A]'
                        )}
                      />
                      <span className="truncate">{sub.name}</span>
                    </span>

                    {typeof sub.productCount === 'number' && (
                      <span
                        className={cn(
                          'text-[10px] font-semibold',
                          isSubActive ? 'text-[#D4A76A]' : 'text-white/35 group-hover:text-white/60'
                        )}
                      >
                        {sub.productCount}
                      </span>
                    )}
                  </button>

                  {/* Sub-children (e.g. Additifs -> Additif Essence, Additif Diesel, Additif Huile) */}
                  {hasSubChildren && (
                    <ul className="ml-4 mt-1 space-y-0.5 border-l border-white/10 pl-2">
                      {sub.children!.map((subChild) => {
                        const isSubChildActive = activeChildSlug === subChild.slug
                        return (
                          <li key={subChild.slug}>
                            <button
                              type="button"
                              onClick={() => {
                                onChildClick(subChild.slug)
                                setIsOpen(false)
                              }}
                              className={cn(
                                'flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-[12px] transition-colors',
                                isSubChildActive
                                  ? 'bg-[#D4A76A]/20 font-bold text-[#D4A76A]'
                                  : 'text-white/65 hover:bg-white/5 hover:text-white'
                              )}
                            >
                              <span className="truncate">{subChild.name}</span>
                              {typeof subChild.productCount === 'number' && (
                                <span className="text-[10px] text-white/30">
                                  {subChild.productCount}
                                </span>
                              )}
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        </div>,
        document.body
      )}
    </div>
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
    <label className="group flex min-h-9 cursor-pointer items-center gap-3 rounded-xl px-2 py-1 transition-all hover:bg-white/5">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span
        aria-hidden="true"
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200',
          checked
            ? 'border-[#D4A76A] bg-[#D4A76A] text-[#16254c] shadow-[0_0_10px_rgba(212,167,106,0.3)]'
            : 'border-white/20 bg-white/5 text-transparent group-hover:border-white/40 group-hover:bg-white/10'
        )}
      >
        <Check
          size={13}
          strokeWidth={3.5}
          className={cn(
            'transition-transform duration-200',
            checked ? 'scale-100' : 'scale-50 opacity-0'
          )}
        />
      </span>
      <span
        className={cn(
          'text-[13px] transition-colors',
          checked
            ? 'font-bold text-white'
            : 'text-white/70 group-hover:text-white'
        )}
      >
        {label}
      </span>
    </label>
  )
}