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
import { useSearchParams, usePathname } from 'next/navigation'
import { Filter, Car, Search } from 'lucide-react'
import { useState, useMemo } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import Link from 'next/link'

export default function CataloguePage() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] === 'en' ? 'en' : 'fr'
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  const vehicleMake = searchParams.get('make')
  const vehicleModel = searchParams.get('model')
  const vehicleEngine = searchParams.get('engine')
  const isVehicleSearch = !!(vehicleMake && vehicleModel)

  const specType = searchParams.get('vehicleType')
  const specCylinders = searchParams.get('cylinders')
  const specPower = searchParams.get('power')
  const specFuelType = searchParams.get('fuelType')
  const isSpecSearch = !!(specType && specCylinders && specPower && specFuelType)

  const isSearchMode = isVehicleSearch || isSpecSearch

  const filters: Record<string, string | number | boolean | undefined> = {}
  searchParams.forEach((value, key) => {
    if (['make', 'model', 'engine', 'vehicleType', 'cylinders', 'power', 'fuelType'].includes(key)) return
    if (value === 'true') filters[key] = true
    else if (value === 'false') filters[key] = false
    else if (!isNaN(Number(value)) && key.includes('price')) filters[key] = Number(value)
    else filters[key] = value
  })
  filters.page = Number(filters.page) || 1

  const { data, isLoading, isError, refetch } = useQuery<any>({
    queryKey: isVehicleSearch
      ? ['compatible-products', vehicleMake, vehicleModel, vehicleEngine]
      : isSpecSearch
        ? ['oil-recommendations', specType, specCylinders, specPower, specFuelType, searchParams.get('make') || undefined]
        : ['products', filters],
    queryFn: () => {
      if (isVehicleSearch) {
        return productsApi.getCompatible(vehicleMake!, vehicleModel!, vehicleEngine || undefined)
      }
      if (isSpecSearch) {
        return productsApi.getOilRecommendations({
          vehicleType: specType!,
          cylinders: Number(specCylinders),
          power: Number(specPower),
          fuelType: specFuelType as any,
          make: searchParams.get('make') || undefined,
        })
      }
      return productsApi.getAll(filters as any)
    },
  })

  const products = useMemo(() => {
    if (!data) return []
    let list: any[] = []
    if (isVehicleSearch) list = Array.isArray(data) ? data : []
    else if (isSpecSearch) list = data?.data ?? []
    else list = data.data ?? []
    
    if (isSearchMode && searchParams.get('sortBy')) {
       const sort = searchParams.get('sortBy')
       list = [...list].sort((a, b) => {
         const pA = a.variants?.[0]?.priceHT || 0
         const pB = b.variants?.[0]?.priceHT || 0
         if (sort === 'price_asc') return pA - pB
         if (sort === 'price_desc') return pB - pA
         return 0
       })
    }
    return list
  }, [data, isVehicleSearch, isSpecSearch, searchParams])

  const productCount = useMemo(() => {
    if (!data) return 0
    if (isVehicleSearch) return Array.isArray(data) ? data.length : 0
    if (isSpecSearch) return data?.total ?? 0
    return data.total ?? 0
  }, [data, isVehicleSearch, isSpecSearch])

  const pageTitle = isVehicleSearch
    ? `Huiles compatibles ${vehicleMake} ${vehicleModel}${vehicleEngine ? ' ' + vehicleEngine : ''}`
    : isSpecSearch
      ? `Huiles ${specFuelType === 'diesel' ? 'Diesel' : 'Essence'} — ${specCylinders} cyl., ${specPower} CV`
      : 'Catalogue de Produits'

  const breadcrumbItems = isVehicleSearch
    ? [
        { label: 'Catalogue', href: '/catalogue' },
        { label: `${vehicleMake} ${vehicleModel}` },
      ]
    : isSpecSearch
      ? [
          { label: 'Catalogue', href: '/catalogue' },
          { label: 'Par caractéristiques' },
        ]
      : [{ label: 'Catalogue' }]

  const emptyTitle = isVehicleSearch
    ? "Aucune huile trouvée pour ce véhicule"
    : isSpecSearch
      ? "Aucune huile ne correspond à ces caractéristiques"
      : "Oups ! Aucun produit trouvé"

  const emptyMessage = isVehicleSearch
    ? "Nous n'avons pas encore référencé d'huile compatible pour ce véhicule dans notre base."
    : isSpecSearch
      ? "Le catalogue n'a pas encore été renseigné pour ces caractéristiques. Revenez bientôt, les données produit sont en cours d'ajout."
      : "Nous n'avons pas trouvé de produits correspondant à vos critères de recherche."

  const emptyAction = isVehicleSearch
    ? undefined
    : {
        label: isSpecSearch ? 'Rechercher par véhicule' : 'Effacer tous les filtres',
        onClick: () => { window.location.href = `/${locale}/catalogue` },
      }

  return (
    <div className="section-padding py-8">
      <Breadcrumb items={breadcrumbItems} />

      <div className="mt-6 flex flex-col gap-8 md:flex-row">
        {!isSearchMode && (
          <aside className="hidden w-64 shrink-0 lg:block">
            <FilterSidebar />
          </aside>
        )}

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              {isSearchMode && (
                <div className="mb-2 flex items-center gap-2 text-sm text-brand-accent">
                  {isVehicleSearch ? <Car size={16} /> : <Search size={16} />}
                  <span>{isVehicleSearch ? 'Recherche par véhicule' : 'Recherche par caractéristiques'}</span>
                </div>
              )}
              <h1 className="font-display text-[#111] text-2xl font-bold md:text-3xl">
                {pageTitle}
              </h1>
              <p className="mt-1 text-gray-500">{productCount} produit{productCount !== 1 ? 's' : ''} trouvé{productCount !== 1 ? 's' : ''}</p>
            </div>

            <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
              {!isSearchMode && (
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
                    className="bg-white w-full flex flex-col p-0 sm:max-w-sm border-r-0"
                  >
                    <div className="flex-1 overflow-y-auto p-6 pb-24">
                      <h2 className="font-display text-[#111] mb-6 text-xl font-bold">
                        Filtres
                      </h2>
                      <FilterSidebar />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white/90 backdrop-blur-md p-4 shadow-overlay">
                      <button 
                        onClick={() => setIsMobileFiltersOpen(false)}
                        className="btn-primary w-full shadow-md"
                      >
                        Afficher les résultats
                      </button>
                    </div>
                  </SheetContent>
                </Sheet>
              )}
              <SortDropdown />
            </div>
          </div>

          {!isSearchMode && <ActiveFilters />}

          {isLoading ? (
            <ProductGridSkeleton count={12} />
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : products.length > 0 ? (
            <>
              <ProductGrid products={products} />
              {!isSearchMode ? (
                <Pagination currentPage={data.page} totalPages={data.totalPages} />
              ) : (
                <Pagination currentPage={1} totalPages={1} />
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <EmptyState
                title={emptyTitle}
                message={emptyMessage}
                action={emptyAction}
              />
              {isVehicleSearch && (
                <div className="mt-6 border-t border-gray-100 pt-6 text-center">
                  <p className="mb-3 text-sm text-gray-500">
                    Vous ne trouvez pas votre véhicule&nbsp;? Essayez la recherche par caractéristiques moteur.
                  </p>
                  <Link
                    href={`/${locale}/#oil-finder`}
                    className="inline-flex items-center gap-2 rounded-lg border border-brand-accent/30 bg-brand-accent/5 px-5 py-2.5 text-sm font-semibold text-brand-accent transition-colors hover:bg-brand-accent/10"
                  >
                    <Search size={16} />
                    Rechercher par caractéristiques
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
