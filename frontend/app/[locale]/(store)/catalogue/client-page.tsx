"use client"

import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Car, Search, Sparkles, X } from 'lucide-react'
import Link from 'next/link'
import { productsApi } from '@/lib/api/products'
import { useRouter } from '@/i18n/routing'
import { FilterSidebar } from '@/components/catalogue/FilterSidebar'
import { MobileFiltersSheet } from '@/components/catalogue/MobileFiltersSheet'
import { ActiveFilters } from '@/components/catalogue/ActiveFilters'
import { SortDropdown } from '@/components/catalogue/SortDropdown'
import { ProductGrid } from '@/components/catalogue/ProductGrid'
import { Pagination } from '@/components/catalogue/Pagination'
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

  const vehicleMake = searchParams.get('make')
  const vehicleModel = searchParams.get('model')
  const vehicleEngine = searchParams.get('engine')
  const isVehicleSearch = Boolean(vehicleMake && vehicleModel)

  const specType = searchParams.get('vehicleType')
  const specCylinders = searchParams.get('cylinders')
  const specPower = searchParams.get('power')
  const specFuelType = searchParams.get('fuelType')
  const isSpecSearch = Boolean(specType && specCylinders && specPower && specFuelType)
  const isSearchMode = isVehicleSearch || isSpecSearch

  useEffect(() => {
    setSearchValue(searchParams.get('search') || '')
  }, [searchParams])

  const filters = useMemo(() => {
    const nextFilters: Record<string, string | number | boolean | undefined> = {}
    searchParams.forEach((value, key) => {
      if (VEHICLE_QUERY_KEYS.includes(key)) return
      if (value === 'true') nextFilters[key] = true
      else if (value === 'false') nextFilters[key] = false
      else if (!Number.isNaN(Number(value)) && key.includes('price')) nextFilters[key] = Number(value)
      else nextFilters[key] = value
    })
    nextFilters.page = Number(nextFilters.page) || 1
    return nextFilters
  }, [searchParams])

  const { data, isLoading, isError, refetch } = useQuery<any>({
    queryKey: isVehicleSearch
      ? ['compatible-products', vehicleMake, vehicleModel, vehicleEngine]
      : isSpecSearch
        ? ['oil-recommendations', specType, specCylinders, specPower, specFuelType, searchParams.get('make') || undefined]
        : ['products', filters],
    queryFn: () => {
      if (isVehicleSearch) return productsApi.getCompatible(vehicleMake!, vehicleModel!, vehicleEngine || undefined)
      if (isSpecSearch) {
        return productsApi.getOilRecommendations({
          vehicleType: specType!,
          cylinders: Number(specCylinders),
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
    let list: any[] = isVehicleSearch ? (Array.isArray(data) ? data : []) : isSpecSearch ? (data.data ?? []) : (data.data ?? [])

    if (isSearchMode && searchParams.get('sortBy')) {
      const sort = searchParams.get('sortBy')
      list = [...list].sort((a, b) => {
        const priceA = a.variants?.[0]?.priceHT || 0
        const priceB = b.variants?.[0]?.priceHT || 0
        if (sort === 'price_asc') return priceA - priceB
        if (sort === 'price_desc') return priceB - priceA
        if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        return 0
      })
    }
    return list
  }, [data, isVehicleSearch, isSpecSearch, isSearchMode, searchParams])

  const productCount = useMemo(() => {
    if (!data) return 0
    if (isVehicleSearch) return Array.isArray(data) ? data.length : 0
    if (isSpecSearch) return data.total ?? 0
    return data.total ?? 0
  }, [data, isVehicleSearch, isSpecSearch])

  const vehicleLabel = `${vehicleMake ?? ''} ${vehicleModel ?? ''}${vehicleEngine ? ` ${vehicleEngine}` : ''}`.trim()
  const pageTitle = isVehicleSearch
    ? t('compatibleOilsTitle', { vehicle: vehicleLabel })
    : isSpecSearch
      ? t('specOilsTitle', {
          fuel: t(specFuelType === 'diesel' ? 'diesel' : 'petrol'),
          cylinders: specCylinders ?? '',
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

  const emptyTitle = isVehicleSearch ? t('emptyVehicleTitle') : isSpecSearch ? t('emptySpecTitle') : t('emptyDefaultTitle')
  const emptyMessage = isVehicleSearch ? t('emptyVehicleMessage') : isSpecSearch ? t('emptySpecMessage') : t('emptyDefaultMessage')
  const emptyAction = isVehicleSearch
    ? undefined
    : {
        label: isSpecSearch ? t('searchByVehicleAction') : t('clearAllFilters'),
        onClick: () => router.push('/catalogue'),
      }

  return (
    <div className="bg-white">
      <section className="relative isolate overflow-hidden bg-[#0B0B0C] text-white">
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-full bg-[url('/img/hero/hero_car_bg.png')] bg-cover bg-right bg-no-repeat opacity-30 mix-blend-screen lg:w-3/4"
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#0B0B0C_0%,rgba(11,11,12,0.92)_46%,rgba(11,11,12,0.28)_100%)]" aria-hidden="true" />
        <div className="section-padding relative py-12 md:py-16">
          <div className="grid max-w-5xl gap-9 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
            <div>
              <p className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-[#ff504a]">
                <span className="h-px w-8 bg-[#E10600]" />
                {isSearchMode ? t('precisionSearch') : t('catalogEyebrow')}
              </p>
              <h1 className="max-w-3xl text-4xl font-black uppercase leading-[0.92] tracking-[-0.055em] text-white sm:text-5xl md:text-6xl">
                {pageTitle}
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-6 text-white/70 md:text-base">
                {isSearchMode ? t('searchModeIntro') : t('catalogIntro')}
              </p>
            </div>
            <Link
              href={`/${locale}/#oil-finder`}
              className="group flex items-center gap-3 border border-white/20 bg-white/[0.06] p-4 transition-colors hover:border-[#E10600] hover:bg-[#E10600]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#E10600] text-white transition-colors group-hover:bg-white group-hover:text-[#E10600]">
                <Car size={19} />
              </span>
              <span>
                <span className="block text-[10px] font-black uppercase tracking-[0.15em] text-white/55 group-hover:text-white/70">{t('vehicleFinderLabel')}</span>
                <span className="mt-1 block text-sm font-bold">{t('findMyOil')}</span>
              </span>
            </Link>
          </div>

          {!isSearchMode && (
            <div className="mt-9 max-w-4xl">
              <form onSubmit={handleSearchSubmit} className="flex border border-white/25 bg-white p-1.5 shadow-[0_18px_44px_rgba(0,0,0,0.28)]">
                <Search className="ml-3 shrink-0 self-center text-[#0B0B0C]" size={19} />
                <label className="sr-only" htmlFor="catalogue-search">{t('searchProducts')}</label>
                <input
                  id="catalogue-search"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder={t('searchProducts')}
                  className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm font-semibold text-[#111] outline-none placeholder:text-neutral-500"
                />
                {searchValue && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchValue('')
                      updateFilter('search', null)
                    }}
                    className="mr-1 flex h-10 w-10 items-center justify-center text-neutral-500 transition-colors hover:text-[#111]"
                    aria-label={t('clearSearch')}
                  >
                    <X size={17} />
                  </button>
                )}
                <button type="submit" className="flex min-h-11 items-center gap-2 bg-[#E10600] px-4 text-xs font-black uppercase tracking-[0.13em] text-white transition-colors hover:bg-[#bd0500] sm:px-5">
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
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            {!isSearchMode && <MobileFiltersSheet />}
            <SortDropdown />
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {!isSearchMode && (
            <aside className="hidden w-[276px] shrink-0 lg:block">
              <div className="sticky top-24"><FilterSidebar /></div>
            </aside>
          )}

          <div className="min-w-0 flex-1">
            {!isSearchMode && <ActiveFilters />}
            
            {(() => {
              const categorySlug = searchParams.get('categorySlug')
              const STRICT_COMPATIBILITY_CATEGORIES = [
                'auto-pieces-rechange',
                'auto-filtres',
                'auto-freinage',
                'auto-moteur-distribution',
                'auto-suspension-direction',
                'auto-transmission-embrayage',
                'auto-refroidissement-climatisation',
                'auto-electricite-eclairage',
                'auto-carrosserie-habitacle',
                'auto-echappement'
              ]
              const requiresVehicle = categorySlug && STRICT_COMPATIBILITY_CATEGORIES.includes(categorySlug) && !isVehicleSearch
              
              if (requiresVehicle) {
                return (
                  <div className="border border-black/10 bg-neutral-50 px-5 py-12 text-center sm:px-8">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E10600]/10 mb-4">
                      <Car className="text-[#E10600]" size={32} />
                    </div>
                    <h3 className="mb-2 text-xl font-black uppercase tracking-[-0.03em] text-[#111]">
                      {locale === 'en' ? 'Select your vehicle' : 'Sélectionnez votre véhicule'}
                    </h3>
                    <p className="mx-auto mb-6 max-w-md text-sm text-neutral-500">
                      {locale === 'en' 
                        ? 'To view parts in this category (Filters, Brakes, Suspension, etc.), you must first select your vehicle to ensure 100% compatibility.' 
                        : 'Pour voir les pièces de cette catégorie (Filtres, Freinage, Suspension, etc.), veuillez d\'abord sélectionner votre véhicule afin de garantir une compatibilité à 100%.'}
                    </p>
                    <Link 
                      href={`/${locale}/#oil-finder`} 
                      className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#E10600] px-6 text-xs font-black uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#bd0500]"
                    >
                      <Car size={16} />
                      {locale === 'en' ? 'Select Vehicle' : 'Sélectionner un véhicule'}
                    </Link>
                  </div>
                )
              }

              if (isLoading) return <ProductGridSkeleton count={12} />
              if (isError) return <ErrorState onRetry={() => refetch()} />
              
              if (products.length > 0) {
                return (
                  <>
                    <ProductGrid products={products} />
                    <Pagination currentPage={isSearchMode ? 1 : (data?.page ?? 1)} totalPages={isSearchMode ? 1 : (data?.totalPages ?? 1)} />
                  </>
                )
              }

              return (
                <div className="border border-black/10 bg-neutral-50 px-5 py-3 sm:px-8">
                  <EmptyState title={emptyTitle} message={emptyMessage} action={emptyAction} />
                  {isVehicleSearch && (
                    <div className="mb-8 border-t border-black/10 pt-6 text-center">
                      <p className="mb-3 text-sm text-neutral-500">{t('vehicleNotFoundHint')}</p>
                      <Link href={`/${locale}/#oil-finder`} className="inline-flex min-h-11 items-center gap-2 bg-[#E10600] px-5 text-xs font-black uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#bd0500]">
                        <Car size={16} />
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
      className={`min-h-8 border px-2.5 text-[10px] font-black uppercase tracking-[0.12em] transition-colors ${
        active ? 'border-[#E10600] bg-[#E10600] text-white' : 'border-white/20 bg-white/[0.05] text-white hover:border-white hover:bg-white hover:text-[#111]'
      }`}
    >
      <Sparkles size={11} className="mr-1.5 inline-block" />
      {label}
    </button>
  )
}
