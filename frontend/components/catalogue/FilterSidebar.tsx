"use client";

import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/lib/api/categories'
import { brandsApi } from '@/lib/api/brands'
import { useRouter, useSearchParams } from 'next/navigation'
import { Slider } from '@/components/ui/slider'

import { FilterSidebarSkeleton } from '../common/Skeleton'

export function FilterSidebar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const { data: categories, isLoading: catLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  })

  const { data: brands, isLoading: brandsLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: brandsApi.getAll,
  })

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    // Reset page on filter change
    params.delete('page')
    router.push(`/catalogue?${params.toString()}`)
  }

  const currentCategory = searchParams.get('categorySlug') || ''
  const currentBrand = searchParams.get('brandSlug') || ''
  const inStockOnly = searchParams.get('inStockOnly') === 'true'
  const isPromo = searchParams.get('isPromo') === 'true'

  if (catLoading || brandsLoading) {
    return <FilterSidebarSkeleton />
  }

  return (
    <div className="border-brand-surface-dark w-full space-y-8 rounded-2xl border bg-white/80 backdrop-blur-xl p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300">
      {/* Categories */}
      <div>
        <h3 className="font-display text-brand-primary border-brand-surface-dark mb-4 border-b pb-2 text-sm uppercase tracking-widest font-bold">
          Catégories
        </h3>
        <ul className="custom-scrollbar max-h-[250px] space-y-2 overflow-y-auto pr-2">
          <li>
            <button
              onClick={() => updateFilters('categorySlug', null)}
              className={`hover:text-brand-accent hover:translate-x-1 flex w-full text-left text-sm transition-all ${!currentCategory ? 'text-brand-primary font-bold' : 'text-gray-500'}`}
            >
              Toutes les catégories
            </button>
          </li>
          {categories?.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => updateFilters('categorySlug', cat.slug)}
                className={`hover:text-brand-accent hover:translate-x-1 flex w-full justify-between text-left text-sm transition-all ${currentCategory === cat.slug ? 'text-brand-primary font-bold' : 'text-gray-500'}`}
              >
                <span className="truncate">{cat.name}</span>
                <span className="bg-brand-surface text-brand-primary ml-2 rounded-md px-1.5 py-0.5 text-[10px] font-semibold opacity-70">
                  {cat.productCount}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Brands */}
      <div>
        <h3 className="font-display text-brand-primary border-brand-surface-dark mb-4 border-b pb-2 text-sm uppercase tracking-widest font-bold">
          Marques
        </h3>
        <ul className="custom-scrollbar max-h-[250px] space-y-2 overflow-y-auto pr-2">
          <li>
            <button
              onClick={() => updateFilters('brandSlug', null)}
              className={`hover:text-brand-accent hover:translate-x-1 flex w-full text-left text-sm transition-all ${!currentBrand ? 'text-brand-primary font-bold' : 'text-gray-500'}`}
            >
              Toutes les marques
            </button>
          </li>
          {brands?.map((brand) => (
            <li key={brand.id}>
              <button
                onClick={() => updateFilters('brandSlug', brand.slug)}
                className={`hover:text-brand-accent hover:translate-x-1 flex w-full justify-between text-left text-sm transition-all ${currentBrand === brand.slug ? 'text-brand-primary font-bold' : 'text-gray-500'}`}
              >
                <span className="truncate">{brand.name}</span>
                <span className="bg-brand-surface text-brand-primary ml-2 rounded-md px-1.5 py-0.5 text-[10px] font-semibold opacity-70">
                  {brand.productCount}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Viscosity */}
      <div>
        <h3 className="font-display text-brand-primary border-brand-surface-dark mb-4 border-b pb-2 text-sm uppercase tracking-widest font-bold">
          Viscosité
        </h3>
        <div className="custom-scrollbar grid max-h-[150px] grid-cols-2 gap-2 overflow-y-auto pr-2 lg:grid-cols-3">
          {[
            '0W20', '0W30', '0W40', '5W20', '5W30', '5W40',
            '10W40', '10W60', '15W40', '15W50', '20W50',
            '75W80', '75W90', '80W90', '85W140', 'ATF',
            'CVT', 'DCT', 'DOT 4', 'DOT 5.1', 'LHM',
            'SAE 30', 'ISO VG 46', 'ISO VG 68',
          ].map((visc) => (
            <button
              key={visc}
              onClick={() =>
                updateFilters('viscosity', searchParams.get('viscosity') === visc ? null : visc)
              }
              className={`truncate rounded-lg border px-1 py-1.5 text-center text-[10px] font-medium transition-all duration-200 active:scale-95 ${
                searchParams.get('viscosity') === visc
                  ? 'bg-brand-primary border-brand-primary text-brand-accent shadow-md'
                  : 'hover:border-brand-primary/40 border-gray-100 bg-gray-50 text-gray-600 hover:bg-white hover:shadow-sm'
              }`}
            >
              {visc}
            </button>
          ))}
        </div>
      </div>

      {/* Type d'huile */}
      <div>
        <h3 className="font-display text-brand-primary border-brand-surface-dark mb-4 border-b pb-2 text-sm uppercase tracking-widest font-bold">
          Type d'huile
        </h3>
        <div className="flex flex-col gap-3">
          {[
            '100% Synthèse',
            'Minérale',
            'Semi-Synthèse',
            'Synthèse',
            'Technologie de Synthèse',
          ].map((type) => (
            <label key={type} className="group flex cursor-pointer items-center gap-3">
              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${searchParams.get('type') === type ? 'border-brand-primary bg-brand-primary' : 'border-gray-300 bg-white group-hover:border-brand-primary/50'}`}>
                {searchParams.get('type') === type && (
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <input
                type="checkbox"
                className="sr-only"
                checked={searchParams.get('type') === type}
                onChange={() =>
                  updateFilters('type', searchParams.get('type') === type ? null : type)
                }
              />
              <span className={`text-sm transition-colors ${searchParams.get('type') === type ? 'text-brand-primary font-medium' : 'text-gray-600 group-hover:text-brand-primary'}`}>
                {type}
              </span>
            </label>
          ))}
        </div>
      </div>
      {/* Normes API */}
      <div>
        <h3 className="font-display text-brand-primary border-brand-surface-dark mb-4 border-b pb-2 text-sm uppercase tracking-widest font-bold">
          Normes API
        </h3>
        <div className="custom-scrollbar flex max-h-[120px] flex-col gap-3 overflow-y-auto pr-2">
          {[
            'API SL', 'API SM', 'API SN', 'API SP',
            'API CF', 'API CI-4', 'API CJ-4', 'API CK-4',
          ].map((norm) => (
            <label key={norm} className="group flex cursor-pointer items-center gap-3">
              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${searchParams.get('api') === norm ? 'border-brand-primary bg-brand-primary' : 'border-gray-300 bg-white group-hover:border-brand-primary/50'}`}>
                {searchParams.get('api') === norm && (
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <input
                type="checkbox"
                className="sr-only"
                checked={searchParams.get('api') === norm}
                onChange={() => updateFilters('api', searchParams.get('api') === norm ? null : norm)}
              />
              <span className={`text-sm transition-colors ${searchParams.get('api') === norm ? 'text-brand-primary font-medium' : 'text-gray-600 group-hover:text-brand-primary'}`}>
                {norm}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Normes ACEA */}
      <div>
        <h3 className="font-display text-brand-primary border-brand-surface-dark mb-4 border-b pb-2 text-sm uppercase tracking-widest font-bold">
          Normes ACEA
        </h3>
        <div className="custom-scrollbar flex max-h-[120px] flex-col gap-3 overflow-y-auto pr-2">
          {[
            'ACEA A3/B4', 'ACEA C2', 'ACEA C3', 'ACEA C4', 'ACEA C5',
            'ACEA E4', 'ACEA E6', 'ACEA E7', 'ACEA E9',
          ].map((norm) => (
            <label key={norm} className="group flex cursor-pointer items-center gap-3">
              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${searchParams.get('acea') === norm ? 'border-brand-primary bg-brand-primary' : 'border-gray-300 bg-white group-hover:border-brand-primary/50'}`}>
                {searchParams.get('acea') === norm && (
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <input
                type="checkbox"
                className="sr-only"
                checked={searchParams.get('acea') === norm}
                onChange={() => updateFilters('acea', searchParams.get('acea') === norm ? null : norm)}
              />
              <span className={`text-sm transition-colors ${searchParams.get('acea') === norm ? 'text-brand-primary font-medium' : 'text-gray-600 group-hover:text-brand-primary'}`}>
                {norm}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Approbations OEM */}
      <div>
        <h3 className="font-display text-brand-primary border-brand-surface-dark mb-4 border-b pb-2 text-sm uppercase tracking-widest font-bold">
          Approbations OEM
        </h3>
        <div className="custom-scrollbar flex max-h-[150px] flex-col gap-3 overflow-y-auto pr-2">
          {[
            'VW 504.00/507.00', 'VW 502.00/505.00', 'MB-Approval 229.51', 
            'MB-Approval 229.3', 'BMW Longlife-04', 'BMW Longlife-01',
            'Porsche C30', 'Porsche A40', 'Renault RN0700/RN0710',
            'Renault RN17', 'PSA B71 2290', 'Ford WSS-M2C913-D'
          ].map((oem) => (
            <label key={oem} className="group flex cursor-pointer items-center gap-3">
              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${searchParams.get('oem') === oem ? 'border-brand-primary bg-brand-primary' : 'border-gray-300 bg-white group-hover:border-brand-primary/50'}`}>
                {searchParams.get('oem') === oem && (
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <input
                type="checkbox"
                className="sr-only"
                checked={searchParams.get('oem') === oem}
                onChange={() => updateFilters('oem', searchParams.get('oem') === oem ? null : oem)}
              />
              <span className={`text-sm transition-colors ${searchParams.get('oem') === oem ? 'text-brand-primary font-medium' : 'text-gray-600 group-hover:text-brand-primary'}`}>
                {oem}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Emballage */}
      <div>
        <h3 className="font-display text-brand-primary border-brand-surface-dark mb-4 border-b pb-2 text-sm uppercase tracking-widest font-bold">
          Emballage
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {['1L', '2L', '4L', '5L', '20L', '60L', '209L'].map((vol) => (
            <button
              key={vol}
              onClick={() => updateFilters('volume', searchParams.get('volume') === vol ? null : vol)}
              className={`rounded-lg border px-2 py-1.5 text-center text-[10px] font-medium transition-all duration-200 active:scale-95 ${
                searchParams.get('volume') === vol
                  ? 'bg-brand-primary border-brand-primary text-brand-accent shadow-md'
                  : 'hover:border-brand-primary/40 border-gray-100 bg-gray-50 text-gray-600 hover:bg-white hover:shadow-sm'
              }`}
            >
              {vol}
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div>
        <h3 className="font-display text-brand-primary border-brand-surface-dark mb-4 border-b pb-2 text-sm uppercase tracking-widest font-bold">
          Options
        </h3>
        <div className="space-y-4">
          <label className="group flex cursor-pointer items-center gap-3">
            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${inStockOnly ? 'border-brand-primary bg-brand-primary' : 'border-gray-300 bg-white group-hover:border-brand-primary/50'}`}>
              {inStockOnly && (
                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <input
              type="checkbox"
              className="sr-only"
              checked={inStockOnly}
              onChange={(e) => updateFilters('inStockOnly', e.target.checked ? 'true' : null)}
            />
            <span className={`text-sm transition-colors ${inStockOnly ? 'text-brand-primary font-medium' : 'text-gray-600 group-hover:text-brand-primary'}`}>
              En stock uniquement
            </span>
          </label>
          
          <label className="group flex cursor-pointer items-center gap-3">
            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${isPromo ? 'border-brand-accent bg-brand-accent' : 'border-gray-300 bg-white group-hover:border-brand-accent/50'}`}>
              {isPromo && (
                <svg className="h-3 w-3 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <input
              type="checkbox"
              className="sr-only"
              checked={isPromo}
              onChange={(e) => updateFilters('isPromo', e.target.checked ? 'true' : null)}
            />
            <span className={`text-sm transition-colors ${isPromo ? 'text-brand-primary font-medium' : 'text-gray-600 group-hover:text-brand-primary'}`}>
              En promotion
            </span>
          </label>
        </div>
      </div>
    </div>
  )
}
