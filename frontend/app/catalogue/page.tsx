'use client'

import { useQuery } from '@tanstack/react-query'
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

export default function CataloguePage() {
  const searchParams = useSearchParams()
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  // Construct filters object from URLSearchParams
  const filters: Record<string, string | number | boolean | undefined> = {}
  searchParams.forEach((value, key) => {
    if (value === 'true') filters[key] = true
    else if (value === 'false') filters[key] = false
    else if (!isNaN(Number(value)) && key.includes('price')) filters[key] = Number(value)
    else filters[key] = value
  })

  // Ensure page is set
  filters.page = Number(filters.page) || 1

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsApi.getAll(filters as import('@/lib/types').ProductFilters),
  })

  return (
    <div className="section-padding py-8">
      <Breadcrumb
        items={[
          { label: 'Catalogue' },
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
              <h1 className="text-2xl md:text-3xl font-display font-bold text-brand-primary">
                Catalogue de Produits
              </h1>
              <p className="text-gray-500 mt-1">
                {data?.total || 0} produits trouvés
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Mobile Filters Trigger */}
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
              message="Aucun produit ne correspond à vos critères de recherche. Essayez de modifier vos filtres."
              action={{ label: "Effacer les filtres", onClick: () => window.location.href = '/catalogue' }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
