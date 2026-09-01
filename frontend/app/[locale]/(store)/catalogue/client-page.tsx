"use client"

import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Search, Sparkles, X, LayoutGrid, List, Phone, Mail, Droplets, ShieldCheck, Gauge, Info, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { productsApi } from '@/lib/api/products'
import { useRouter } from '@/i18n/routing'
import { useVehicleStore } from '@/lib/store/vehicle.store'
import { useVehicleUrlSync } from '@/lib/hooks/useVehicleUrlSync'
import { FilterSidebar } from '@/components/catalogue/FilterSidebar'
import { MobileFiltersSheet } from '@/components/catalogue/MobileFiltersSheet'
import { ActiveFilters } from '@/components/catalogue/ActiveFilters'
import { SortDropdown } from '@/components/catalogue/SortDropdown'
import { ProductGrid } from '@/components/catalogue/ProductGrid'
import { Pagination } from '@/components/catalogue/Pagination'
import { VehicleContextBar } from '@/components/catalogue/VehicleContextBar'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { ProductGridSkeleton } from '@/components/common/Skeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'

const VEHICLE_QUERY_KEYS = ['make', 'model', 'engine', 'vehicleType', 'cylinders', 'power', 'fuelType']

export default function CataloguePage() {
  const t = useTranslations('Catalogue')
  const locale = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    const savedMode = localStorage.getItem('catalogueViewMode') as 'grid' | 'list'
    if (savedMode === 'grid' || savedMode === 'list') {
      setViewMode(savedMode)
    }
  }, [])

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode)
    localStorage.setItem('catalogueViewMode', mode)
  }

  const storedVehicle = useVehicleStore((state) => state.vehicle)

  useVehicleUrlSync(true)

  const vehicleMake = searchParams.get('make')
  const vehicleModel = searchParams.get('model')
  const vehicleEngine = searchParams.get('engine')
  const isOilFinder = searchParams.get('isOilFinder') === 'true'
  const isVehicleSearch = Boolean(vehicleMake && vehicleModel)

  const specType = searchParams.get('vehicleType')
  const specDisplacement = searchParams.get('displacementCc')
  const specPower = searchParams.get('power')
  const specFuelType = searchParams.get('fuelType')
  const isSpecSearch = Boolean(specType && specDisplacement && specPower && specFuelType)
  const isSearchMode = isVehicleSearch || isSpecSearch

  useEffect(() => {
    setSearchValue(searchParams.get('search') || '')
  }, [searchParams])

  const filters = useMemo(() => {
    const nextFilters: Record<string, string | number | boolean | undefined> = {}
    searchParams.forEach((value, key) => {
      if (VEHICLE_QUERY_KEYS.includes(key) || key === 'displacementCc' || key === 'isOilFinder') return
      if (value === 'true') nextFilters[key] = true
      else if (value === 'false') nextFilters[key] = false
      else if (!Number.isNaN(Number(value)) && key.includes('price')) nextFilters[key] = Number(value)
      else nextFilters[key] = value
    })
    nextFilters.page = Number(nextFilters.page) || 1
    return nextFilters
  }, [searchParams])

  // Fall back to the persisted store vehicle when the URL carries none
  // (e.g. after refreshing, or arriving from a plain /catalogue link).
  const activeVehicle = isVehicleSearch
    ? {
        makeSlug: vehicleMake!,
        modelSlug: vehicleModel!,
        engineCode: vehicleEngine ?? undefined,
        makeName: vehicleMake!,
        modelName: vehicleModel!,
      }
    : storedVehicle

  const { data, isLoading, isError, refetch } = useQuery<any>({
    queryKey: isVehicleSearch
      ? ['compatible-products', vehicleMake, vehicleModel, vehicleEngine, filters, isOilFinder]
      : isSpecSearch
        ? ['oil-recommendations', specType, specDisplacement, specPower, specFuelType, searchParams.get('make') || undefined]
        : ['products', filters],
    queryFn: () => {
      if (isVehicleSearch) {
        if (isOilFinder || filters.categorySlug === 'huiles-moteur') {
          return productsApi.getOilByVehicle({
            make: vehicleMake!,
            model: vehicleModel!,
            engineCode: vehicleEngine || undefined,
          })
        }
        return productsApi.getCompatible({
          make: vehicleMake!,
          model: vehicleModel!,
          engine: vehicleEngine || undefined,
          categorySlug: filters.categorySlug as string | undefined,
          search: filters.search as string | undefined,
          brands: filters.brands as string | undefined,
          viscosity: filters.viscosity as string | undefined,
          priceMin: filters.priceMin as number | undefined,
          priceMax: filters.priceMax as number | undefined,
          inStockOnly: filters.inStockOnly as boolean | undefined,
          isNew: filters.isNew as boolean | undefined,
          isFeatured: filters.isFeatured as boolean | undefined,
          type: filters.type as string | undefined,
          api: filters.api as string | undefined,
          acea: filters.acea as string | undefined,
          volume: filters.volume as string | undefined,
          sortBy: filters.sortBy as string | undefined,
          page: filters.page as number | undefined,
        })
      }
      if (isSpecSearch) {
        return productsApi.getOilRecommendations({
          vehicleType: specType!,
          displacementCc: Number(specDisplacement),
          power: Number(specPower),
          fuelType: specFuelType as 'diesel' | 'essence',
          make: searchParams.get('make') || undefined,
        })
      }
      return productsApi.getAll(filters as any)
    },
  })

  const products = useMemo(() => {
    if (!data) return []
    if (isVehicleSearch) return data.data ?? []
    if (isSpecSearch) return data.data ?? []
    return data.data ?? []
  }, [data, isVehicleSearch, isSpecSearch])

  const productCount = useMemo(() => {
    if (!data) return 0
    if (isVehicleSearch) return data.total ?? 0
    return data.total ?? 0
  }, [data, isVehicleSearch])

  const vehicleLabel = activeVehicle
    ? [activeVehicle.makeName, activeVehicle.modelName, activeVehicle.engineCode]
        .filter(Boolean)
        .join(' ')
    : ''

  const categorySlug = searchParams.get('categorySlug')
  const categoryName = categorySlug ? (data?.categoryName || categorySlug) : null

  const pageTitle = isVehicleSearch
    ? t('compatibleOilsTitle', { vehicle: vehicleLabel })
    : isSpecSearch
      ? t('specOilsTitle', {
          fuel: t(specFuelType === 'diesel' ? 'diesel' : 'petrol'),
          cylinders: specDisplacement ?? '',
          power: specPower ?? '',
        })
      : t('catalogTitle')

  const breadcrumbItems = isVehicleSearch
    ? [{ label: t('catalogTitle'), href: '/catalogue' }, { label: vehicleLabel }]
    : isSpecSearch
      ? [{ label: t('catalogTitle'), href: '/catalogue' }, { label: t('bySpecs') }]
      : [{ label: t('catalogTitle') }]

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    router.push(`/catalogue?${params.toString()}`)
  }

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    updateFilter('search', searchValue.trim() || null)
  }

  const clearVehicle = () => {
    useVehicleStore.getState().clearVehicle()
    const params = new URLSearchParams(searchParams.toString())
    ;['make', 'model', 'engine'].forEach((key) => params.delete(key))
    params.delete('page')
    router.push(`/catalogue?${params.toString()}`)
  }

  const emptyTitle = isVehicleSearch ? t('emptyVehicleTitle') : isSpecSearch ? t('emptySpecTitle') : t('emptyDefaultTitle')
  const emptyMessage = isVehicleSearch ? t('emptyVehicleMessage') : isSpecSearch ? t('emptySpecMessage') : t('emptyDefaultMessage')
  const emptyAction = isVehicleSearch
    ? {
        label: t('searchAllCatalog'),
        onClick: clearVehicle,
      }
    : {
        label: t('clearAllFilters'),
        onClick: () => router.push('/catalogue'),
      }

  return (
    <div className="bg-white">
      <section className="relative isolate overflow-hidden bg-[#0B0B0C] text-white">
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-full bg-[url('/img/hero/hero_car_bg.png')] bg-cover bg-right bg-no-repeat opacity-30 mix-blend-screen lg:w-3/4"
          aria-hidden="true"
        />
        <div className="section-padding relative py-12 md:py-16">
          <div className="max-w-5xl">
            <div>
              <p className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-[#D4A76A]">
                <span className="h-px w-8 bg-[#D4A76A]" />
                {isSearchMode ? t('precisionSearch') : t('catalogEyebrow')}
              </p>
              <h1 className="max-w-3xl text-4xl font-black uppercase leading-[0.92] tracking-[-0.055em] text-white sm:text-5xl md:text-6xl">
                {pageTitle}
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-6 text-white/70 md:text-base">
                {isSearchMode ? t('searchModeIntro') : t('catalogIntro')}
              </p>
            </div>
          </div>

          {!isSpecSearch && (
            <div className="mt-9 max-w-4xl">
              <form onSubmit={handleSearchSubmit} className="flex rounded-xl border border-white/10 bg-[#0a1128]/40 p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.28)] backdrop-blur-md">
                <Search className="ml-3 shrink-0 self-center text-white/50" size={19} />
                <label className="sr-only" htmlFor="catalogue-search">{t('searchProducts')}</label>
                <input
                  id="catalogue-search"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder={t('searchProducts')}
                  className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm font-semibold text-white outline-none placeholder:text-white/40"
                />
                {searchValue && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchValue('')
                      updateFilter('search', null)
                    }}
                    className="mr-1 flex h-10 w-10 items-center justify-center text-white/40 transition-colors hover:text-white"
                    aria-label={t('clearSearch')}
                  >
                    <X size={17} />
                  </button>
                )}
                <button type="submit" className="flex min-h-11 items-center gap-2 rounded-lg bg-[#D4A76A] px-4 text-xs font-black uppercase tracking-[0.13em] text-[#16254c] shadow-[0_0_15px_rgba(212,167,106,0.2)] transition-all hover:bg-[#e8b975] hover:shadow-[0_0_20px_rgba(212,167,106,0.4)] sm:px-5">
                  <Search size={15} />
                  <span className="hidden sm:inline">{t('searchAction')}</span>
                </button>
              </form>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="mr-1 text-[10px] font-black uppercase tracking-[0.15em] text-white/50">{t('quickFilters')}</span>
                <QuickFilter label={t('inStockOnly')} active={searchParams.get('inStockOnly') === 'true'} onClick={() => updateFilter('inStockOnly', searchParams.get('inStockOnly') === 'true' ? null : 'true')} />
                <QuickFilter label={t('newArrivals')} active={searchParams.get('isNew') === 'true'} onClick={() => updateFilter('isNew', searchParams.get('isNew') === 'true' ? null : 'true')} />
                <QuickFilter label={t('featuredProducts')} active={searchParams.get('isFeatured') === 'true'} onClick={() => updateFilter('isFeatured', searchParams.get('isFeatured') === 'true' ? null : 'true')} />
              </div>
            </div>
          )}
        </div>
      </section>

      <main className="section-padding pb-16 pt-1 md:pb-24">
        <Breadcrumb items={breadcrumbItems} />

        <div className="mb-7 flex flex-col justify-between gap-4 border-b border-black/10 pb-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xl font-black tracking-[-0.03em] text-[#111]">{t('productsFound', { count: productCount })}</p>
            {!isLoading && !isSearchMode && <p className="mt-1 text-sm text-neutral-500">{t('catalogueHint')}</p>}
            {isVehicleSearch && !isLoading && (
              <p className="mt-1 text-sm font-medium text-[#16254c]">
                {t('compatiblePartsHint', { vehicle: vehicleLabel })}
              </p>
            )}
          </div>
          <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
            <div className="flex h-10 items-center rounded border border-black/10 bg-white p-1">
              <button
                type="button"
                onClick={() => handleViewModeChange('grid')}
                className={`flex h-full w-9 items-center justify-center rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-[#16254c] text-white shadow-sm' : 'text-neutral-400 hover:text-[#111]'
                }`}
                aria-label={t('gridView', { fallback: 'Grid view' })}
              >
                <LayoutGrid size={16} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={() => handleViewModeChange('list')}
                className={`flex h-full w-9 items-center justify-center rounded transition-colors ${
                  viewMode === 'list' ? 'bg-[#16254c] text-white shadow-sm' : 'text-neutral-400 hover:text-[#111]'
                }`}
                aria-label={t('listView', { fallback: 'List view' })}
              >
                <List size={18} strokeWidth={2.5} />
              </button>
            </div>
            {!isSpecSearch && <MobileFiltersSheet />}
            <SortDropdown />
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {!isSpecSearch && (
            <aside className="hidden w-[276px] shrink-0 lg:block">
              <div className="sticky top-24"><FilterSidebar /></div>
            </aside>
          )}

          <div className="min-w-0 flex-1">
            {!isSpecSearch && <ActiveFilters />}

            {isVehicleSearch && <VehicleContextBar />}

            {(() => {
              if (isLoading) return <ProductGridSkeleton count={12} />
              if (isError) return <ErrorState onRetry={() => refetch()} />

              if (products.length > 0) {
                return (
                  <>
                    {isVehicleSearch && data?.oilSpec && (
                      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 via-white to-blue-50/50 p-4 text-xs shadow-xs">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-2xs">
                            <ShieldCheck size={18} />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-blue-950">Spécification constructeur recommandée :</span>
                              <span className="rounded-md bg-blue-900 px-2.5 py-0.5 font-black text-white shadow-xs">
                                {data.oilSpec.viscosity}
                              </span>
                              {data.oilSpec.oemApproval && (
                                <span className="rounded-md bg-white px-2.5 py-0.5 font-semibold text-blue-900 ring-1 ring-blue-200">
                                  {data.oilSpec.oemApproval}
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-[11px] text-blue-700/80">
                              Ces huiles répondent aux normes d'origine prescrites pour votre moteur.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg bg-white/80 px-3 py-1.5 text-[11px] font-medium text-neutral-600 ring-1 ring-black/5">
                          <BookOpen size={13} className="text-blue-600" />
                          <span>Vérifiez toujours votre carnet d'entretien</span>
                        </div>
                      </div>
                    )}
                    <ProductGrid products={products} viewMode={viewMode} />
                    <Pagination currentPage={data?.page ?? 1} totalPages={data?.totalPages ?? 1} />
                  </>
                )
              }

              return (
                <div className="border border-black/10 bg-neutral-50 px-5 py-3 sm:px-8">
                  {isVehicleSearch && data?.oilSpec && (
                    <div className="mb-8 mt-4 overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">
                      {/* Header */}
                      <div className="border-b border-blue-100 bg-gradient-to-b from-blue-50/90 to-blue-50/30 px-6 py-6 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xs">
                          <Droplets size={24} />
                        </div>
                        <h3 className="text-xl font-black tracking-tight text-blue-950">
                          Recommandation Huile Constructeur
                        </h3>
                        <p className="mt-1 text-xs sm:text-sm text-blue-800/80 max-w-xl mx-auto">
                          Cette référence n'est pas disponible immédiatement en ligne. Voici les spécifications techniques officielles pour votre véhicule :
                        </p>
                        
                        {/* Spec Pills */}
                        <div className="mt-4 flex flex-wrap justify-center gap-2.5">
                          {data.oilSpec.viscosity && (
                            <div className="flex items-center gap-1.5 rounded-xl bg-blue-900 px-3.5 py-1.5 text-sm font-black text-white shadow-xs">
                              <span>Viscosité :</span>
                              <span className="text-amber-300">{data.oilSpec.viscosity}</span>
                            </div>
                          )}
                          {data.oilSpec.apiStandard && (
                            <div className="rounded-xl bg-white px-3.5 py-1.5 text-xs sm:text-sm font-bold text-blue-900 shadow-xs ring-1 ring-blue-200">
                              {data.oilSpec.apiStandard.startsWith('API') ? data.oilSpec.apiStandard : `API ${data.oilSpec.apiStandard}`}
                            </div>
                          )}
                          {data.oilSpec.aceaStandard && (
                            <div className="rounded-xl bg-white px-3.5 py-1.5 text-xs sm:text-sm font-bold text-blue-900 shadow-xs ring-1 ring-blue-200">
                              {data.oilSpec.aceaStandard.startsWith('ACEA') ? data.oilSpec.aceaStandard : `ACEA ${data.oilSpec.aceaStandard}`}
                            </div>
                          )}
                          {data.oilSpec.oemApproval && (
                            <div className="rounded-xl bg-white px-3.5 py-1.5 text-xs sm:text-sm font-bold text-blue-900 shadow-xs ring-1 ring-blue-200">
                              Norme : {data.oilSpec.oemApproval}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Contact SpecPart Availability Block */}
                      <div className="p-6">
                        <div className="rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50/90 via-amber-50/50 to-amber-100/40 p-5 shadow-xs">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-3.5">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-2xs">
                                <Phone size={20} />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-amber-950">
                                  Contacter SpecPart pour commander cette huile
                                </h4>
                                <p className="mt-0.5 text-xs text-amber-800/90 max-w-md leading-relaxed">
                                  Nos experts vérifient l'inventaire en boutique ou commandent directement votre bidon auprès de nos fournisseurs certifiés.
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                              <a
                                href="tel:+21629294195"
                                className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 rounded-xl bg-[#001E3C] hover:bg-[#002B56] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition active:scale-95"
                              >
                                <Phone size={14} />
                                +216 29 294 195
                              </a>
                              <Link
                                href={`/${locale}/contact?subject=${encodeURIComponent(`Disponibilité huile ${data.oilSpec.viscosity} pour ${vehicleMake || ''} ${vehicleModel || ''}`)}`}
                                className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-xs font-bold text-neutral-900 shadow-2xs transition hover:bg-amber-50/50 active:scale-95"
                              >
                                <Mail size={14} />
                                Envoyer un message
                              </Link>
                            </div>
                          </div>
                        </div>

                        {/* Dual Compliance & Manual Notice Grid */}
                        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3.5 text-left">
                          {/* Card 1: Official Manufacturer Manual Compliance Notice */}
                          <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 transition-all hover:bg-slate-50">
                            <div className="flex items-start gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                                <ShieldCheck size={17} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                    Conformité Manuel Constructeur
                                  </h5>
                                  <span className="rounded bg-blue-100 px-1.5 py-0.2 text-[10px] font-bold text-blue-700">OEM</span>
                                </div>
                                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                                  Les viscosités et homologations ci-dessus sont issues des cahiers des charges constructeurs. Pour préserver votre moteur et la garantie constructeur, consultez toujours les préconisations exactes figurant dans votre <strong>manuel d'utilisation / carnet d'entretien</strong>.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Card 2: Level & Dipstick Filling Guideline */}
                          <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 transition-all hover:bg-slate-50">
                            <div className="flex items-start gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                                <Gauge size={17} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                    Contrôle du Niveau à la Jauge
                                  </h5>
                                  <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-700">Sécurité</span>
                                </div>
                                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                                  Ajustez la quantité d'huile progressivement moteur froid sur sol horizontal. Le niveau doit impérativement se situer <strong>entre les repères MIN et MAX</strong> de la jauge manuelle. <strong>Ne dépassez jamais le repère MAX</strong>.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <EmptyState title={emptyTitle} message={emptyMessage} action={emptyAction} />
                  
                  {isVehicleSearch && (
                    <div className="mb-8 border-t border-black/10 pt-6 text-center">
                      <p className="mb-3 text-sm text-neutral-500">{t('vehicleNotFoundHint')}</p>
                      <Link href={`/${locale}/#oil-finder`} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#D4A76A] px-5 text-xs font-black uppercase tracking-[0.12em] text-[#16254c] shadow-[0_0_15px_rgba(212,167,106,0.3)] transition-all hover:bg-[#e8b975] hover:shadow-[0_0_20px_rgba(212,167,106,0.5)]">
                        <svg width="15" height="15" viewBox="0 0 32 32" fill="none"><path d="M16 4C16 4 8 13.5 8 19.5C8 23.6 11.6 27 16 27C20.4 27 24 23.6 24 19.5C24 13.5 16 4 16 4Z" fill="currentColor" opacity="0.9"/></svg>
                        {t('searchBySpecs')}
                      </Link>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        </div>
      </main>
    </div>
  )
}

function QuickFilter({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-8 rounded-lg border px-3 text-[10px] font-black uppercase tracking-[0.12em] transition-all ${
        active ? 'border-[#D4A76A]/50 bg-[#16254c] text-[#D4A76A] shadow-[0_0_10px_rgba(212,167,106,0.2)]' : 'border-white/10 bg-[#0a1128]/40 text-white/60 hover:border-[#D4A76A]/30 hover:bg-[#16254c]/60 hover:text-white'
      }`}
    >
      <Sparkles size={11} className="mr-1.5 inline-block" />
      {label}
    </button>
  )
}