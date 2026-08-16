'use client'

import { useQuery } from '@tanstack/react-query'
import { brandsApi } from '@/lib/api/brands'
import { productsApi } from '@/lib/api/products'
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
import { use } from 'react'
import type { ProductFilters } from '@/lib/types'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

export default function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const searchParams = useSearchParams()
  const t = useTranslations('Catalogue')

  const { data: brand, isLoading: brandLoading } = useQuery<any>({
    queryKey: ['brand', slug],
    queryFn: () => brandsApi.getBySlug(slug),
  })

  // Construct filters object from URLSearchParams
  const filters: ProductFilters = { brandSlug: slug }
  searchParams.forEach((value, key) => {
    const k = key as keyof ProductFilters
    if (value === 'true') (filters as Record<string, unknown>)[k] = true
    else if (value === 'false') (filters as Record<string, unknown>)[k] = false
    else if (!isNaN(Number(value)) && key.includes('price'))
      (filters as Record<string, unknown>)[k] = Number(value)
    else (filters as Record<string, unknown>)[k] = value
  })

  // Ensure page is set
  filters.page = Number(filters.page) || 1

  const {
    data: productsData,
    isLoading: productsLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery<any>({
    queryKey: ['products', filters],
    queryFn: () => productsApi.getAll(filters),
  })

  if (brandLoading) {
    return <div className="section-padding py-20 text-center">Chargement de la marque...</div>
  }

  if (!brand && !brandLoading) {
    return <div className="section-padding py-20 text-center">Marque introuvable.</div>
  }

  return (
    <div>
      {/* Brand Header */}
      <div className="bg-brand-surface border-brand-surface-dark border-b py-12">
        <div className="section-padding flex flex-col items-center gap-8 md:flex-row">
          {brand?.logo && (
            <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <Image
                src={brand.logo}
                alt={brand.name}
                width={100}
                height={100}
                className="object-contain"
              />
            </div>
          )}
          <div className="text-center md:text-left">
            <h1 className="font-display text-brand-primary mb-3 text-3xl font-bold md:text-4xl">
              {brand?.name}
            </h1>
            {brand?.description && <p className="max-w-2xl text-gray-600">{brand.description}</p>}
          </div>
        </div>
      </div>

      <div className="section-padding py-8">
        <Breadcrumb
          items={[{ label: 'Marques', href: '/marques' }, { label: brand?.name || slug }]}
        />

        <div className="mt-6 flex flex-col gap-8 md:flex-row">
          {/* Desktop Sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <FilterSidebar hideBrands />
          </aside>

          {/* Main Content */}
          <div className="min-w-0 flex-1">
            <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-display text-brand-primary text-2xl font-bold">
                  Produits {brand?.name}
                </h2>
                <p className="mt-1 flex items-center gap-2 text-gray-500">
                  {productsData?.total || 0} produits trouvés
                  {isFetching && !productsLoading && (
                    <Loader2 size={13} className="animate-spin text-[#E10600]" aria-label={t('updating')} />
                  )}
                </p>
              </div>

              <div className="flex w-full items-center gap-3 sm:w-auto">
                <MobileFiltersSheet hideBrands />
                <SortDropdown />
              </div>
            </div>

            <ActiveFilters />

            {productsLoading ? (
              <ProductGridSkeleton count={12} />
            ) : isError ? (
              <ErrorState onRetry={() => refetch()} />
            ) : productsData && productsData.data.length > 0 ? (
              <>
                <ProductGrid products={productsData.data} />
                <Pagination currentPage={productsData.page} totalPages={productsData.totalPages} />
              </>
            ) : (
              <EmptyState
                message="Aucun produit ne correspond à vos critères de recherche pour cette marque."
                action={{
                  label: 'Effacer les filtres',
                  onClick: () => (window.location.href = `/marque/${slug}`),
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
