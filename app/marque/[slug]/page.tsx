'use client'

import { useQuery } from '@tanstack/react-query'
import { brandsApi } from '@/lib/api/brands'
import { productsApi } from '@/lib/api/products'
import { FilterSidebar } from '@/components/catalogue/FilterSidebar'
import { ActiveFilters } from '@/components/catalogue/ActiveFilters'
import { SortDropdown } from '@/components/catalogue/SortDropdown'
import { ProductGrid } from '@/components/catalogue/ProductGrid'
import { Pagination } from '@/components/catalogue/Pagination'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { ProductGridSkeleton } from '@/components/common/Skeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { useSearchParams } from 'next/navigation'
import { Filter } from 'lucide-react'
import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useParams } from 'next/navigation'
import type { ProductFilters } from '@/lib/types'
import Image from 'next/image'

export default function BrandPage() {
  const params = useParams()
  const slug = params.slug as string
  const searchParams = useSearchParams()
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  const { data: brand, isLoading: brandLoading } = useQuery({
    queryKey: ['brand', slug],
    queryFn: () => brandsApi.getBySlug(slug),
  })

  // Construct filters object from URLSearchParams
  const filters: ProductFilters = { brandSlug: slug }
  searchParams.forEach((value, key) => {
    const k = key as keyof ProductFilters
    if (value === 'true') (filters as Record<string, unknown>)[k] = true
    else if (value === 'false') (filters as Record<string, unknown>)[k] = false
    else if (!isNaN(Number(value)) && key.includes('price')) (filters as Record<string, unknown>)[k] = Number(value)
    else (filters as Record<string, unknown>)[k] = value
  })

  // Ensure page is set
  filters.page = Number(filters.page) || 1

  const { data: productsData, isLoading: productsLoading, isError, refetch } = useQuery({
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
      <div className="bg-brand-surface py-12 border-b border-brand-surface-dark">
        <div className="section-padding flex flex-col md:flex-row items-center gap-8">
          {brand?.logo && (
            <div className="w-32 h-32 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center p-4 shrink-0">
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
            <h1 className="text-3xl md:text-4xl font-display font-bold text-brand-primary mb-3">
              {brand?.name}
            </h1>
            {brand?.description && (
              <p className="text-gray-600 max-w-2xl">{brand.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="section-padding py-8">
        <Breadcrumb
          items={[
            { label: 'Marques', href: '/marques' },
            { label: brand?.name || slug },
          ]}
        />

        <div className="flex flex-col md:flex-row gap-8 mt-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <FilterSidebar />
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-display font-bold text-brand-primary">
                  Produits {brand?.name}
                </h2>
                <p className="text-gray-500 mt-1">
                  {productsData?.total || 0} produits trouvés
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
                  <SheetTrigger render={<button className="lg:hidden flex items-center justify-center gap-2 btn-secondary py-2 flex-1 sm:flex-none" />}>
                    <Filter size={18} />
                    Filtres
                  </SheetTrigger>
                  <SheetContent side="left" className="w-full sm:max-w-sm overflow-y-auto bg-brand-surface p-0">
                    <div className="p-6">
                      <h2 className="text-xl font-display font-bold text-brand-primary mb-6">Filtres</h2>
                      <FilterSidebar />
                    </div>
                  </SheetContent>
                </Sheet>

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
                action={{ label: "Effacer les filtres", onClick: () => window.location.href = `/marque/${slug}` }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
