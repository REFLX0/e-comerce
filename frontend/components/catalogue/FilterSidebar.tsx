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
const DEFAULT_BATTERY_TYPES = ['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'AGM', 'EFB', 'JIS']

/** Every accordion section — all open by default; state persists while mounted. */
const DEFAULT_OPEN_SECTIONS = ['brands', 'budget', 'battery-type', 'viscosity', 'packaging', 'oil-type', 'api', 'acea', 'availability']

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
  /** Hide the top header (used inside sheets/drawers with their own header) */
  hideHeader?: boolean
  /** Remove container border/background for nested embedding */
  nested?: boolean
}

export function FilterSidebar({
  mode = 'instant',
  draft,
  onDraftChange,
  hideCategories = false,
  hideBrands = false,
  baseFilters = {},
  hideHeader = false,
  nested = false,
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

  const [isMobileScreen, setIsMobileScreen] = useState(false)
  useEffect(() => {
    const check = () => setIsMobileScreen(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  const isMobileOrDraft = inDraft || isMobileScreen

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
      batteryType: searchParams.get('batteryType') || undefined,
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

  // Mapping for aliases so subcategories and roots resolve their true product counts
  const CATEGORY_ALIASES: Record<string, string[]> = useMemo(() => ({
    'batteries': ['batteries', 'ap-cat-batterie', 'ap-cat-batteries', 'auto-electricite-eclairage'],
    'auto-pieces-rechange': ['auto-pieces-rechange', 'pieces-auto', 'pieces-de-rechange'],
    'automobile': ['automobile', 'auto'],
    'autres-liquides-entretien': ['autres-liquides-entretien', 'liquides-auto', 'antigel-refroidissement', 'adblue', 'refroidissement', 'produits-entretien', 'entretien-auto'],
    'antigel-ldr': ['antigel-ldr', 'refroidissement', 'antigel-refroidissement', 'liquides-auto'],
    'produits-entretien': ['produits-entretien', 'entretien-auto', 'liquides-auto'],
    'accessoires-auto': ['accessoires-auto', 'accessoires'],
    'accessoires-moto': ['accessoires-moto', 'moto-equipements-entretien'],
    'auto-autres-pieces': ['auto-autres-pieces', 'auto-echappement', 'echappement'],
    'transmission': ['transmission', 'auto-transmission', 'boite-vitesse', 'embrayage'],
    'moto-huiles': ['moto-huiles', 'huiles-moto-2t-4t', 'moto-huile-moteur', 'karting-huiles'],
    'moto-huile-boite': ['moto-huile-boite'],
    'moto-huile-fourche': ['moto-huile-fourche', 'huiles-fourche'],
    'moto-lubrifiants-chaine': ['moto-lubrifiants-chaine', 'entretien-chaine', 'additifs-moto'],
    'moto-karting': ['moto-karting', 'moto', 'karting', 'huiles-moto-2t-4t', 'entretien-chaine', 'additifs-moto', 'huiles-fourche', 'moto-huiles', 'moto-huile-boite', 'moto-huile-fourche', 'moto-lubrifiants-chaine'],
    'auto-filtres': ['auto-filtres', 'filtres', 'filtres-air', 'filtres-huile', 'filtres-carburant', 'filtres-habitacle'],
    'auto-electricite-eclairage': ['auto-electricite-eclairage', 'batteries', 'essuie-glaces'],
    'additifs': ['additifs', 'additifs-huile', 'additifs-carburant', 'additif-diesel', 'additif-essence', 'additif-huile', 'additif-boite-pont'],
    'direction-assistee': ['direction-assistee'],
    'liquide-de-frein': ['liquide-de-frein', 'liquide-frein', 'liquide-frein-dot3', 'liquide-frein-dot4', 'liquide-frein-dot5-1'],
    'liquides-auto': ['liquides-auto', 'antigel-refroidissement', 'adblue', 'refroidissement'],
    'marine': ['marine', 'marine-moteurs', 'marine-hydraulique', 'marine-graisses', 'marine-huiles-lubrifiants'],
    'huiles-moteur': ['huiles-moteur', 'huiles-moteur-auto', 'huiles-moteur-specifiques', 'auto-synthese', 'auto-semi', 'auto-minerale'],
    'huile-de-boite': ['huile-de-boite', 'huiles-boite-transmission'],
  }), [])

  // Build the list of categories with resolved taxonomy subcategories
  const resolvedCategories = useMemo(() => {
    const getCountForSlug = (slug: string, dbId?: string, fallbackCount = 0): number => {
      if (!facets?.categoryCounts) return fallbackCount
      const aliases = CATEGORY_ALIASES[slug] || [slug]
      const counts = facets.categoryCounts as any[]
      let total = 0
      const seen = new Set<string>()
      for (const a of aliases) {
        const found = counts.find((c) => (c.slug === a || (dbId && c.id === dbId)) && !seen.has(c.id))
        if (found) {
          seen.add(found.id)
          total += (found.count ?? 0)
        }
      }
      return Math.max(total, fallbackCount)
    }

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
          
          const count = getCountForSlug(subChild.slug, subChildDbNode?.id, subChildDbNode?.productCount ?? 0)

          return {
            id: subChildDbNode?.id ?? subChild.slug,
            name: subChildLabel,
            slug: subChild.slug,
            productCount: count,
          }
        })

        const directChildCount = getCountForSlug(child.slug, childDbNode?.id, childDbNode?.productCount ?? 0)
        const subSum = subSubcategories.reduce((acc, sub) => acc + (sub.productCount ?? 0), 0)
        const childCount = subSubcategories.length ? Math.max(directChildCount, subSum) : directChildCount

        return {
          id: childDbNode?.id ?? child.slug,
          name: childLabel,
          slug: child.slug,
          productCount: childCount,
          children: subSubcategories.length ? subSubcategories : undefined,
        }
      })

      const directRootCount = getCountForSlug(item.slug, dbNode?.id, dbNode?.productCount ?? 0)
      const subSum = subcategories.reduce((acc, sub) => acc + (sub.productCount ?? 0), 0)
      const rootCount = subcategories.length ? Math.max(directRootCount, subSum) : directRootCount

      return {
        id: dbNode?.id ?? item.slug,
        slug: item.slug,
        label,
        Icon,
        count: rootCount,
        subcategories,
      }
    })
  }, [categoriesTree, tTax, facets?.categoryCounts, CATEGORY_ALIASES])

  const batteryTypes = useMemo(() => {
    if (facets?.batteryTypes && facets.batteryTypes.length > 0) {
      return facets.batteryTypes.map((b) => ({ value: b.value, count: b.count }))
    }
    return DEFAULT_BATTERY_TYPES.map((b) => ({ value: b, count: undefined }))
  }, [facets?.batteryTypes])

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
  const isBattery =
    currentCategorySlug === 'batteries' ||
    baseFilters?.categorySlug === 'batteries' ||
    searchParams.get('categorySlug') === 'batteries'

  return (
    <div
      className={cn(
        nested
          ? 'w-full text-white'
          : 'rounded-2xl border border-white/10 bg-gradient-to-br from-[#16254c] to-[#0a1128] shadow-2xl backdrop-blur-xl'
      )}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      {!hideHeader && (
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
      )}

      <div className={cn('space-y-6', nested ? 'p-1' : 'p-5')}>
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

              {/* Taxonomy categories with hover flyout or inline accordion */}
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
                  isMobileOrDraft={isMobileOrDraft}
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

          {/* Battery Type */}
          {(isBattery || (facets?.batteryTypes && facets.batteryTypes.length > 0) || Boolean(read('batteryType'))) && (
            <FilterSection
              value="battery-type"
              title={t('batteryType') || 'Type de Batterie'}
              activeCount={read('batteryType') ? 1 : 0}
              onClear={() => patch({ batteryType: null })}
            >
              <div className="flex flex-wrap gap-2">
                {batteryTypes.map(({ value: bType, count }) => {
                  const active = read('batteryType') === bType
                  return (
                    <button
                      key={bType}
                      type="button"
                      onClick={() => toggleSingle('batteryType', bType)}
                      aria-pressed={active}
                      className={cn(
                        'rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A76A]/40',
                        active
                          ? 'border-[#D4A76A] bg-[#D4A76A] font-bold text-[#16254c] shadow-[0_0_15px_rgba(212,167,106,0.3)]'
                          : 'border-white/10 bg-white/5 text-white/80 hover:border-white/20 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      <span>{bType}</span>
                      {count !== undefined && count > 0 && (
                        <span className={cn('ms-1.5 text-[10px]', active ? 'text-[#16254c]/70' : 'text-white/40')}>
                          ({count})
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </FilterSection>
          )}

          {/* Viscosity */}
          {!isBattery && (
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
          )}

          {/* Packaging */}
          {!isBattery && (facets?.volumes?.length ?? 0) > 0 && (
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
                      </button>
                    )
                  })}
              </div>
            </FilterSection>
          )}

          {/* Oil Type */}
          {!isBattery && (
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
          )}

          {/* API Standards */}
          {!isBattery && (
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
          )}

          {/* ACEA Standards */}
          {!isBattery && (
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
          )}

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
  isMobileOrDraft = false,
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
  isMobileOrDraft?: boolean
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

  // Automatically keep accordion open if a child is selected
  useEffect(() => {
    if (hasActiveSub) {
      setIsOpen(true)
    }
  }, [hasActiveSub])

  const isHighlighted = active || hasActiveSub

  const openFlyout = useCallback(() => {
    if (!hasSubs || isMobileOrDraft) return
    if (closeTimer.current) clearTimeout(closeTimer.current)
    if (rowRef.current) {
      const rect = rowRef.current.getBoundingClientRect()
      const maxLeft = typeof window !== 'undefined' ? window.innerWidth - 330 : 0
      setFlyoutPos({ top: Math.max(12, rect.top), left: Math.min(rect.right + 6, Math.max(10, maxLeft)) })
    }
    setIsOpen(true)
  }, [hasSubs, isMobileOrDraft])

  const scheduleClose = useCallback(() => {
    if (isMobileOrDraft) return
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setIsOpen(false), 220)
  }, [isMobileOrDraft])

  const cancelClose = useCallback(() => {
    if (isMobileOrDraft) return
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }, [isMobileOrDraft])

  // Close desktop flyout when window scrolls to keep clean UI
  useEffect(() => {
    if (!isOpen || isMobileOrDraft) return
    const onScroll = () => setIsOpen(false)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isOpen, isMobileOrDraft])

  const handleRowClick = () => {
    onClick()
    if (isMobileOrDraft && hasSubs) {
      setIsOpen((prev) => !prev)
    }
  }

  const handleChevronToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen((prev) => !prev)
  }

  return (
    <div
      ref={rowRef}
      className="relative flex flex-col"
      onMouseEnter={openFlyout}
      onMouseLeave={scheduleClose}
    >
      {/* The main category row button */}
      <button
        type="button"
        onClick={handleRowClick}
        aria-pressed={isHighlighted}
        aria-haspopup={hasSubs && !isMobileOrDraft ? 'menu' : undefined}
        aria-expanded={hasSubs ? isOpen : undefined}
        className={cn(
          'flex min-h-10 w-full items-center justify-between gap-2.5 rounded-xl px-3.5 text-start text-[13px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A76A]/40',
          isHighlighted
            ? 'border border-[#D4A76A]/40 bg-white/10 font-bold text-white shadow-inner'
            : 'border border-transparent text-white/75 hover:border-white/10 hover:bg-white/5 hover:text-white'
        )}
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
          {hasSubs && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleChevronToggle}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation()
                  setIsOpen((prev) => !prev)
                }
              }}
              className="p-1 -mr-1 rounded-md hover:bg-white/10 text-white/40 hover:text-white transition-colors"
              aria-label={isOpen ? 'Fermer' : 'Ouvrir'}
            >
              <ChevronRight
                size={14}
                className={cn(
                  'transition-transform duration-200',
                  isOpen ? 'rotate-90 text-[#D4A76A]' : 'text-white/40'
                )}
              />
            </span>
          )}
        </span>
      </button>

      {/* ── Mobile / Draft Inline Accordion ── */}
      {isMobileOrDraft && isOpen && hasSubs && (
        <div className="ms-3 my-1.5 space-y-1 rounded-xl bg-white/[0.04] p-2 border-s-2 border-[#D4A76A]/40 ps-3">
          {/* Button to select entire parent category */}
          <button
            type="button"
            onClick={onClick}
            className={cn(
              'flex min-h-9 w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-start text-xs font-semibold transition-colors',
              active && !activeChildSlug
                ? 'bg-[#D4A76A]/20 text-[#D4A76A] font-bold shadow-inner'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            )}
          >
            <span>Tous les {label}</span>
            {active && !activeChildSlug && <Check size={13} className="text-[#D4A76A]" />}
          </button>

          {/* Subcategories */}
          {subcategories.map((sub) => {
            const isSubActive = activeChildSlug === sub.slug
            const hasSubChildren = (sub.children?.length ?? 0) > 0

            return (
              <div key={sub.slug} className="flex flex-col space-y-1 pt-0.5">
                <button
                  type="button"
                  onClick={() => onChildClick(sub.slug)}
                  className={cn(
                    'group flex min-h-9 w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-start text-xs transition-colors',
                    isSubActive
                      ? 'bg-[#D4A76A] text-[#16254c] font-bold shadow-sm'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <span className="truncate">{sub.name}</span>
                  {isSubActive && <Check size={13} className="text-[#16254c] shrink-0" />}
                </button>

                {/* Level 3 sub-items if present (e.g. 100% Synthèse, DOT 3/4) */}
                {hasSubChildren && (
                  <div className="ms-2 flex flex-wrap gap-1 border-s border-white/10 ps-2 py-1">
                    {sub.children!.map((subChild) => {
                      const isSubChildActive = activeChildSlug === subChild.slug
                      return (
                        <button
                          key={subChild.slug}
                          type="button"
                          onClick={() => onChildClick(subChild.slug)}
                          className={cn(
                            'rounded-md px-2 py-1 text-[11px] font-medium transition-colors',
                            isSubChildActive
                              ? 'bg-[#D4A76A] text-[#16254c] font-bold shadow-sm'
                              : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                          )}
                        >
                          {subChild.name}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Desktop Flyout Subcategories Panel (Portal to body, only when not mobile/draft) ── */}
      {!isMobileOrDraft && mounted && isOpen && hasSubs && flyoutPos && typeof document !== 'undefined' && createPortal(
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