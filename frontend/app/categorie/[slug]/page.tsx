'use client'

import { useQuery } from '@tanstack/react-query'
import { productsApi } from '@/lib/api/products'
import { categoriesApi } from '@/lib/api/categories'
import type { ProductFilters } from '@/lib/types'
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
import { use, useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const searchParams = useSearchParams()
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

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
  const { data: category, isLoading: catLoading, isError: catError } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => categoriesApi.getBySlug(slug),
  })

  // Fetch Products
  const { data, isLoading, isError, refetch } = useQuery({
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

      <div className="flex flex-col md:flex-row gap-8 mt-6">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <FilterSidebar />
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {catLoading ? (
            <div className="h-10 bg-brand-surface-dark rounded w-1/3 mb-6 animate-pulse" />
          ) : catError ? (
            <div className="mb-6 text-red-500">Impossible de charger les informations de la catégorie.</div>
          ) : category && (
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-display font-bold text-brand-primary">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-gray-500 mt-2 max-w-3xl">
                  {category.description}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <p className="text-gray-500">
              {data?.total || 0} produits trouvés
            </p>

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
              message="Aucun produit ne correspond à vos critères dans cette catégorie."
              action={{ label: "Effacer les filtres", onClick: () => window.location.href = `/categorie/${slug}` }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
