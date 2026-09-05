"use client"

import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Search, Sparkles, X, LayoutGrid, List, Phone, Mail, Droplets, ShieldCheck, Gauge, Info, BookOpen, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { productsApi } from '@/lib/api/products'
import { useRouter } from '@/i18n/routing'
import { formatVehicleDisplayLabel } from '@/lib/utils/compatibility'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
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

  const effectiveMake = vehicleMake || storedVehicle?.makeSlug
  const effectiveModel = vehicleModel || storedVehicle?.modelSlug
  const effectiveEngine = vehicleEngine || storedVehicle?.engineCode
  
  const isVehicleSearch = Boolean(effectiveMake && effectiveModel)

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
        makeSlug: effectiveMake!,
        modelSlug: effectiveModel!,
        engineCode: effectiveEngine ?? undefined,
        makeName: storedVehicle && storedVehicle.makeSlug === effectiveMake ? storedVehicle.makeName : undefined,
        modelName: storedVehicle && storedVehicle.modelSlug === effectiveModel ? storedVehicle.modelName : undefined,
      }
    : storedVehicle

  const { data, isLoading, isError, refetch } = useQuery<any>({
    queryKey: isVehicleSearch
      ? ['compatible-products', effectiveMake, effectiveModel, effectiveEngine, filters, isOilFinder]
      : isSpecSearch
        ? ['oil-recommendations', specType, specDisplacement, specPower, specFuelType, effectiveMake || undefined]
        : ['products', filters],
    queryFn: () => {
      if (isVehicleSearch) {
        if (isOilFinder || filters.categorySlug === 'huiles-moteur') {
          return productsApi.getOilByVehicle({
            make: effectiveMake!,
            model: effectiveModel!,
            engineCode: effectiveEngine || undefined,
          })
        }
        return productsApi.getCompatible({
          make: effectiveMake!,
          model: effectiveModel!,
          engine: effectiveEngine || undefined,
          categorySlug: filters.categorySlug as string | undefined,
          search: filters.search as string | undefined,
          brands: filters.brands as string | undefined,
          viscosity: filters.viscosity as string | undefined,
          batteryType: filters.batteryType as string | undefined,
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

  const vehicleLabel = formatVehicleDisplayLabel(activeVehicle)

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
            <p className="text-xl font-black tracking-[-0.03em] text-[#111]">{t('catalogTitle')}</p>
            {!isLoading && !isSearchMode && <p className="mt-1 text-sm text-neutral-500">{t('catalogueHint')}</p>}
            {isVehicleSearch && !isLoading && (
              <p className="mt-1 text-sm font-medium text-[#16254c]">
                {t('compatiblePartsHint', { vehicle: vehicleLabel })}
              </p>
            )}
          </div>
          <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:justify-end">
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
                    <ProductGrid
                      products={products}
                      viewMode={viewMode}
                    />
                    
                    {data && (
                      <div className="mt-12 flex justify-center pb-8">
                        <Pagination 
                          currentPage={data?.page ?? 1}
                          totalPages={data?.totalPages ?? 1}
                        />
                      </div>
                    )}
                  </>
                )
              }

              if (isVehicleSearch) {
                const whatsappMsg = `Bonjour SpecPart, je recherche l'huile moteur pour mon véhicule ${vehicleLabel}. Pourriez-vous m'indiquer la disponibilité et le tarif ?`
                const whatsappUrl = buildWhatsAppUrl(whatsappMsg)
                const contactSubject = `Disponibilité huile pour ${vehicleLabel}`

                return (
                  <div className="border border-black/10 bg-neutral-50 px-5 py-6 sm:px-8 sm:py-10">
                    <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
                      {/* Header */}
                      <div className="border-b border-amber-100 bg-gradient-to-b from-amber-50/80 to-amber-50/20 px-6 py-8 text-center">
                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm">
                          <Droplets size={28} />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900">
                          Contacter SpecPart pour cette huile
                        </h3>
                        <p className="mt-2 text-sm sm:text-base text-neutral-600 max-w-xl mx-auto leading-relaxed">
                          L'huile moteur pour votre <strong className="text-neutral-900">{vehicleLabel}</strong> n'est pas disponible immédiatement à l'achat en ligne dans notre catalogue.
                        </p>
                        <p className="mt-1 text-xs sm:text-sm text-neutral-500 max-w-lg mx-auto">
                          Nos experts vérifient notre inventaire physique en boutique ou commandent directement le bidon certifié auprès de nos fournisseurs partenaires.
                        </p>

                        {/* Constructeur recommendation pills if known */}
                        {data?.oilSpec && (
                          <div className="mt-5 pt-5 border-t border-amber-200/60">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block mb-2.5">
                              Spécifications constructeur recommandées
                            </span>
                            <div className="flex flex-wrap justify-center gap-2">
                              {data.oilSpec.viscosity && (
                                <div className="flex items-center gap-1.5 rounded-xl bg-[#001E3C] px-3.5 py-1.5 text-xs sm:text-sm font-black text-white shadow-xs">
                                  <span>Viscosité :</span>
                                  <span className="text-amber-300">{data.oilSpec.viscosity}</span>
                                </div>
                              )}
                              {data.oilSpec.apiStandard && (
                                <div className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-neutral-800 shadow-xs ring-1 ring-neutral-200">
                                  {data.oilSpec.apiStandard.startsWith('API') ? data.oilSpec.apiStandard : `API ${data.oilSpec.apiStandard}`}
                                </div>
                              )}
                              {data.oilSpec.aceaStandard && (
                                <div className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-neutral-800 shadow-xs ring-1 ring-neutral-200">
                                  {data.oilSpec.aceaStandard.startsWith('ACEA') ? data.oilSpec.aceaStandard : `ACEA ${data.oilSpec.aceaStandard}`}
                                </div>
                              )}
                              {data.oilSpec.oemApproval && (
                                <div className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-neutral-800 shadow-xs ring-1 ring-neutral-200">
                                  Norme : {data.oilSpec.oemApproval}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Direct Action Buttons */}
                      <div className="p-6 sm:p-8 bg-neutral-50/50">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* 1. Phone Call */}
                          <a
                            href="tel:+21629294195"
                            className="flex flex-col items-center justify-center gap-1 rounded-xl bg-[#001E3C] hover:bg-[#002B56] p-4 text-center text-white shadow-xs transition active:scale-95"
                          >
                            <Phone size={20} className="mb-0.5 text-amber-400" />
                            <span className="text-xs font-bold uppercase tracking-wider text-white/80">Appel direct</span>
                            <span className="text-sm font-black">+216 29 294 195</span>
                          </a>

                          {/* 2. WhatsApp */}
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center justify-center gap-1 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] p-4 text-center text-white shadow-xs transition active:scale-95"
                          >
                            <MessageCircle size={20} className="mb-0.5 text-white" />
                            <span className="text-xs font-bold uppercase tracking-wider text-white/90">WhatsApp</span>
                            <span className="text-sm font-black">Commander par chat</span>
                          </a>

                          {/* 3. Contact message form */}
                          <Link
                            href={`/${locale}/contact?subject=${encodeURIComponent(contactSubject)}`}
                            className="flex flex-col items-center justify-center gap-1 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 p-4 text-center text-neutral-900 shadow-2xs transition active:scale-95"
                          >
                            <Mail size={20} className="mb-0.5 text-neutral-600" />
                            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Par message</span>
                            <span className="text-sm font-black">Envoyer un message</span>
                          </Link>
                        </div>

                        {/* Dual Compliance & Manual Notice Grid if spec exists */}
                        {data?.oilSpec && (
                          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
                              <div className="flex items-start gap-2.5">
                                <ShieldCheck size={16} className="text-blue-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-slate-600 leading-relaxed">
                                  <strong>Conformité constructeur :</strong> vérifiez toujours le carnet d'entretien de votre véhicule pour les tolérances recommandées.
                                </p>
                              </div>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
                              <div className="flex items-start gap-2.5">
                                <Gauge size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-slate-600 leading-relaxed">
                                  <strong>Niveau à la jauge :</strong> l'appoint s'effectue moteur froid entre les repères MIN et MAX sans jamais dépasser le MAX.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Footer secondary action: Browse all oils */}
                        <div className="mt-6 pt-5 border-t border-neutral-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                          <p className="text-xs text-neutral-500">
                            Vous souhaitez explorer d'autres huiles disponibles ?
                          </p>
                          <button
                            type="button"
                            onClick={clearVehicle}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3.5 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition"
                          >
                            Parcourir toutes les huiles du catalogue
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <div className="border border-black/10 bg-neutral-50 px-5 py-3 sm:px-8">
                  <EmptyState title={emptyTitle} message={emptyMessage} action={emptyAction} />
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