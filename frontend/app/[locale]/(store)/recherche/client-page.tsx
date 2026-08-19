"use client";

import { useQuery } from '@tanstack/react-query'
import { productsApi } from '@/lib/api/products'
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
import { useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { ProductFilters } from '@/lib/types'
import { useVehicleUrlSync } from '@/lib/hooks/useVehicleUrlSync'

const VEHICLE_QUERY_KEYS = ['make', 'model', 'engine']

export default function SearchPage() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''
  const t = useTranslations('Catalogue')

  useVehicleUrlSync(true)

  const vehicleMake = searchParams.get('make')
  const vehicleModel = searchParams.get('model')
  const vehicleEngine = searchParams.get('engine')
  const isVehicleSearch = Boolean(vehicleMake && vehicleModel)

  // Construct filters object from URLSearchParams
  const filters: ProductFilters = { search: q }
  searchParams.forEach((value, key) => {
    if (key === 'q' || VEHICLE_QUERY_KEYS.includes(key)) return
    const k = key as keyof ProductFilters
    if (value === 'true') (filters as Record<string, unknown>)[k] = true
    else if (value === 'false') (filters as Record<string, unknown>)[k] = false
    else if (!isNaN(Number(value)) && key.includes('price'))
      (filters as Record<string, unknown>)[k] = Number(value)
    else (filters as Record<string, unknown>)[k] = value
  })

  // Ensure page is set
  filters.page = Number(filters.page) || 1

  const { data, isLoading, isError, refetch } = useQuery<any>({
    queryKey: isVehicleSearch
      ? ['products', 'search-vehicle', vehicleMake, vehicleModel, vehicleEngine, filters]
      : ['products', 'search', filters],
    queryFn: () => {
      if (isVehicleSearch) {
        return productsApi.getCompatible({
          make: vehicleMake!,
          model: vehicleModel!,
          engine: vehicleEngine || undefined,
          search: q || undefined,
          categorySlug: filters.categorySlug as string | undefined,
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
      return productsApi.getAll(filters)
    },
    enabled: !!q || Object.keys(filters).length > 1, // Don't fetch if completely empty
  })

  const vehicleLabel = isVehicleSearch
    ? [vehicleMake, vehicleModel, vehicleEngine].filter(Boolean).join(' ')
    : ''

  return (
    <div className="section-padding py-8">
      <Breadcrumb items={[{ label: 'Recherche' }]} />

      <div className="mt-6 flex flex-col gap-8 md:flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <FilterSidebar hideCategories />
        </aside>

        {/* Main Content */}
        <div className="min-w-0 flex-1">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="font-display text-brand-primary text-2xl font-bold md:text-3xl">
                Résultats pour "{q}"
              </h1>
              <p className="mt-1 text-gray-500">{data?.total || 0} résultats trouvés</p>
              {isVehicleSearch && !isLoading && (
                <p className="mt-1 text-sm font-medium text-[#16254c]">
                  {t('compatiblePartsHint', { vehicle: vehicleLabel })}
                </p>
              )}
            </div>

            <div className="flex w-full items-center gap-3 sm:w-auto">
              <MobileFiltersSheet hideCategories />
              <SortDropdown />
            </div>
          </div>

          <ActiveFilters />

          {isVehicleSearch && <VehicleContextBar />}

          {!q && Object.keys(filters).length <= 1 ? (
            <div className="bg-brand-surface border-brand-surface-dark rounded-2xl border py-20 text-center">
              <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="text-brand-primary text-lg font-bold">Aucune recherche</h3>
              <p className="mt-2 text-gray-500">Veuillez entrer un terme de recherche.</p>
            </div>
          ) : isLoading ? (
            <ProductGridSkeleton count={12} />
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : data && data.data.length > 0 ? (
            <>
              <ProductGrid products={data.data} />
              <Pagination currentPage={data.page} totalPages={data.totalPages} />
            </>
          ) : (
            <EmptyState
              message={
                isVehicleSearch
                  ? t('emptyVehicleMessage')
                  : `Aucun produit ne correspond à la recherche "${q}".`
              }
              action={
                isVehicleSearch
                  ? {
                      label: t('searchAllCatalog'),
                      onClick: () => (window.location.href = `/recherche?q=${encodeURIComponent(q)}`),
                    }
                  : {
                      label: 'Effacer les filtres',
                      onClick: () => (window.location.href = `/recherche?q=${q}`),
                    }
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}