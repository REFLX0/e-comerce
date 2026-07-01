"use client";

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
import { Filter, Search } from 'lucide-react'
import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import type { ProductFilters } from '@/lib/types'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  // Construct filters object from URLSearchParams
  const filters: ProductFilters = { search: q }
  searchParams.forEach((value, key) => {
    if (key === 'q') return
    const k = key as keyof ProductFilters
    if (value === 'true') (filters as Record<string, unknown>)[k] = true
    else if (value === 'false') (filters as Record<string, unknown>)[k] = false
    else if (!isNaN(Number(value)) && key.includes('price'))
      (filters as Record<string, unknown>)[k] = Number(value)
    else (filters as Record<string, unknown>)[k] = value
  })

  // Ensure page is set
  filters.page = Number(filters.page) || 1

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['products', 'search', filters],
    queryFn: () => productsApi.getAll(filters),
    enabled: !!q || Object.keys(filters).length > 1, // Don't fetch if completely empty
  })

  return (
    <div className="section-padding py-8">
      <Breadcrumb items={[{ label: 'Recherche' }]} />

      <div className="mt-6 flex flex-col gap-8 md:flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <FilterSidebar />
        </aside>

        {/* Main Content */}
        <div className="min-w-0 flex-1">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="font-display text-brand-primary text-2xl font-bold md:text-3xl">
                Résultats pour "{q}"
              </h1>
              <p className="mt-1 text-gray-500">{data?.total || 0} résultats trouvés</p>
            </div>

            <div className="flex w-full items-center gap-3 sm:w-auto">
              <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
                <SheetTrigger
                  render={
                    <button className="btn-secondary flex flex-1 items-center justify-center gap-2 py-2 sm:flex-none lg:hidden" />
                  }
                >
                  <Filter size={18} />
                  Filtres
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="bg-brand-surface w-full overflow-y-auto p-0 sm:max-w-sm"
                >
                  <div className="p-6">
                    <h2 className="font-display text-brand-primary mb-6 text-xl font-bold">
                      Filtres
                    </h2>
                    <FilterSidebar />
                  </div>
                </SheetContent>
              </Sheet>

              <SortDropdown />
            </div>
          </div>

          <ActiveFilters />

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
              message={`Aucun produit ne correspond à la recherche "${q}".`}
              action={{
                label: 'Effacer les filtres',
                onClick: () => (window.location.href = `/recherche?q=${q}`),
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
