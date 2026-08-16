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
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { ProductGridSkeleton } from '@/components/common/Skeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { use } from 'react'

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const searchParams = useSearchParams()
  const t = useTranslations('Catalogue')

  // Construct filters
  const filters: Record<string, string | number | boolean | undefined> = {}
  searchParams.forEach((value, key) => {
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

  // Fetch Products
  const { data, isLoading, isFetching, isError, refetch } = useQuery<any>({
    queryKey: ['products-by-category', slug, filters],
    queryFn: () => productsApi.getByCategory(slug, filters as ProductFilters),
  })

  return (
    <div className="section-padding py-8">
      <Breadcrumb
        items={[
          { label: 'Catalogue', href: '/catalogue' },
          { label: category?.name || 'Chargement...' },
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
              Impossible de charger les informations de la catégorie.
            </div>
          ) : (
            category && (
              <div className="mb-6">
                <h1 className="font-display text-[#111] text-2xl font-bold md:text-3xl">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="mt-2 max-w-3xl text-gray-500">{category.description}</p>
                )}
              </div>
            )
          )}

          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <p className="flex items-center gap-2 text-gray-500" aria-live="polite">
              {data?.total || 0} produits trouvés
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
              message="Aucun produit ne correspond à vos critères dans cette catégorie."
              action={{
                label: 'Effacer les filtres',
                onClick: () => (window.location.href = `/categorie/${slug}`),
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
