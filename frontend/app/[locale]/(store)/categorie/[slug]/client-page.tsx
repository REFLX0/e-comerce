'use client'

import { useQuery } from '@tanstack/react-query'
import { productsApi } from '@/lib/api/products'
import { categoriesApi } from '@/lib/api/categories'
import type { ProductFilters } from '@/lib/types'
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
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { use } from 'react'
import { useVehicleUrlSync } from '@/lib/hooks/useVehicleUrlSync'
import { useVehicleStore } from '@/lib/store/vehicle.store'
import { formatVehicleDisplayLabel } from '@/lib/utils/compatibility'

const VEHICLE_QUERY_KEYS = ['make', 'model', 'engine']

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()
  const t = useTranslations('Catalogue')

  const storedVehicle = useVehicleStore((state) => state.vehicle)
  useVehicleUrlSync(true)

  const vehicleMake = searchParams.get('make')
  const vehicleModel = searchParams.get('model')
  const vehicleEngine = searchParams.get('engine')
  const isVehicleSearch = Boolean(vehicleMake && vehicleModel)

  // Construct filters
  const filters: Record<string, string | number | boolean | undefined> = {}
  searchParams.forEach((value, key) => {
    if (VEHICLE_QUERY_KEYS.includes(key)) return
    if (value === 'true') filters[key] = true
    else if (value === 'false') filters[key] = false
    else if (!isNaN(Number(value)) && key.includes('price')) filters[key] = Number(value)
    else filters[key] = value
  })
  filters.page = Number(filters.page) || 1

  // Fetch Category Info
  const {
    data: category,
    isLoading: catLoading,
    isError: catError,
  } = useQuery<any>({
    queryKey: ['category', slug],
    queryFn: () => categoriesApi.getBySlug(slug),
  })

  // Fetch Products — vehicle-aware when a vehicle is in the URL
  const { data, isLoading, isFetching, isError, refetch } = useQuery<any>({
    queryKey: isVehicleSearch
      ? ['products-by-category-vehicle', slug, vehicleMake, vehicleModel, vehicleEngine, filters]
      : ['products-by-category', slug, filters],
    queryFn: () => {
      if (isVehicleSearch) {
        return productsApi.getCompatible({
          make: vehicleMake!,
          model: vehicleModel!,
          engine: vehicleEngine || undefined,
          categorySlug: slug,
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
      return productsApi.getByCategory(slug, filters as ProductFilters)
    },
  })

  const vehicleLabel = isVehicleSearch
    ? formatVehicleDisplayLabel({
        makeSlug: vehicleMake,
        modelSlug: vehicleModel,
        engineCode: vehicleEngine,
        makeName: storedVehicle && storedVehicle.makeSlug === vehicleMake ? storedVehicle.makeName : undefined,
        modelName: storedVehicle && storedVehicle.modelSlug === vehicleModel ? storedVehicle.modelName : undefined,
      })
    : ''

  return (
    <div className="section-padding py-8">
      <Breadcrumb
        items={[
          { label: 'Catalogue', href: '/catalogue' },
          { label: category?.nameFr || category?.name || (catLoading ? t('loading') : slug.replace(/-/g, ' ')) },
        ]}
      />

      <div className="mt-6 flex flex-col gap-8 md:flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <FilterSidebar hideCategories />
        </aside>

        {/* Main Content */}
        <div className="min-w-0 flex-1">
          {catLoading ? (
            <div className="bg-gray-100 mb-6 h-10 w-1/3 animate-pulse rounded" />
          ) : catError ? (
            <div className="mb-6 text-red-500">
              {t('categoryLoadError')}
            </div>
          ) : (
            (category || slug) && (
              <div className="mb-6">
                <h1 className="font-display text-[#111] text-2xl font-bold capitalize md:text-3xl">
                  {category?.nameFr || category?.name || slug.replace(/-/g, ' ')}
                </h1>
                {isVehicleSearch && (
                  <p className="mt-1 text-sm font-medium text-[#16254c]">
                    {t('compatiblePartsHint', { vehicle: vehicleLabel })}
                  </p>
                )}
                {category?.description && (
                  <p className="mt-2 max-w-3xl text-gray-500">{category.description}</p>
                )}
              </div>
            )
          )}

          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <p className="flex items-center gap-2 text-gray-500" aria-live="polite">
              {t('productsFound', { count: data?.total || 0 })}
              {isFetching && !isLoading && (
                <Loader2 size={13} className="animate-spin text-[#E10600]" aria-label={t('updating')} />
              )}
            </p>

            <div className="flex w-full items-center gap-3 sm:w-auto">
              <MobileFiltersSheet />
              <SortDropdown />
            </div>
          </div>

          <ActiveFilters />

          {isVehicleSearch && <VehicleContextBar />}

          {isLoading ? (
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
                  : t('noProductsInCategory')
              }
              action={
                isVehicleSearch
                  ? { label: t('searchAllCatalog'), onClick: () => router.replace(`/catalogue`)}
                  : {
                      label: t('clearFilters'),
                      onClick: () => router.replace(`/categorie/${slug}`),
                    }
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}