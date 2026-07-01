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
    <div className="border-brand-surface-dark w-full space-y-8 rounded-2xl border bg-white p-6 shadow-sm">
      {/* Categories */}
      <div>
        <h3 className="font-display text-brand-primary border-brand-surface-dark mb-4 border-b pb-2 font-semibold">
          Catégories
        </h3>
        <ul className="custom-scrollbar max-h-[250px] space-y-2 overflow-y-auto pr-2">
          <li>
            <button
              onClick={() => updateFilters('categorySlug', null)}
              className={`hover:text-brand-accent w-full text-left text-sm transition-colors ${!currentCategory ? 'text-brand-primary font-bold' : 'text-gray-600'}`}
            >
              Toutes les catégories
            </button>
          </li>
          {categories?.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => updateFilters('categorySlug', cat.slug)}
                className={`hover:text-brand-accent w-full text-left text-sm transition-colors ${currentCategory === cat.slug ? 'text-brand-primary font-bold' : 'text-gray-600'}`}
              >
                {cat.name} <span className="ml-1 text-xs text-gray-400">({cat.productCount})</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Brands */}
      <div>
        <h3 className="font-display text-brand-primary border-brand-surface-dark mb-4 border-b pb-2 font-semibold">
          Marques
        </h3>
        <ul className="custom-scrollbar max-h-[250px] space-y-2 overflow-y-auto pr-2">
          <li>
            <button
              onClick={() => updateFilters('brandSlug', null)}
              className={`hover:text-brand-accent w-full text-left text-sm transition-colors ${!currentBrand ? 'text-brand-primary font-bold' : 'text-gray-600'}`}
            >
              Toutes les marques
            </button>
          </li>
          {brands?.map((brand) => (
            <li key={brand.id}>
              <button
                onClick={() => updateFilters('brandSlug', brand.slug)}
                className={`hover:text-brand-accent w-full text-left text-sm transition-colors ${currentBrand === brand.slug ? 'text-brand-primary font-bold' : 'text-gray-600'}`}
              >
                {brand.name}{' '}
                <span className="ml-1 text-xs text-gray-400">({brand.productCount})</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Viscosity (Hardcoded for demo, normally from API) */}
      <div>
        <h3 className="font-display text-brand-primary border-brand-surface-dark mb-4 border-b pb-2 font-semibold">
          Viscosité
        </h3>
        <div className="custom-scrollbar grid max-h-[150px] grid-cols-2 gap-2 overflow-y-auto pr-2 lg:grid-cols-3">
          {[
            '0W20',
            '0W30',
            '0W40',
            '5W20',
            '5W30',
            '5W40',
            '10W40',
            '10W60',
            '15W40',
            '15W50',
            '20W50',
            '75W80',
            '75W90',
            '80W90',
            '85W140',
            'ATF',
            'CVT',
            'DCT',
            'DOT 4',
            'DOT 5.1',
            'LHM',
            'SAE 30',
            'ISO VG 46',
            'ISO VG 68',
          ].map((visc) => (
            <button
              key={visc}
              onClick={() =>
                updateFilters('viscosity', searchParams.get('viscosity') === visc ? null : visc)
              }
              className={`truncate rounded border px-1 py-1.5 text-center text-[10px] transition-colors ${
                searchParams.get('viscosity') === visc
                  ? 'bg-brand-primary border-brand-primary text-white'
                  : 'hover:border-brand-primary border-gray-200 bg-white text-gray-600'
              }`}
            >
              {visc}
            </button>
          ))}
        </div>
      </div>

      {/* Type d'huile */}
      <div>
        <h3 className="font-display text-brand-primary border-brand-surface-dark mb-4 border-b pb-2 font-semibold">
          Type d'huile
        </h3>
        <div className="flex flex-col gap-2">
          {[
            '100% Synthèse',
            'Minérale',
            'Semi-Synthèse',
            'Synthèse',
            'Technologie de Synthèse',
          ].map((type) => (
            <label key={type} className="group flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={searchParams.get('type') === type}
                onChange={() =>
                  updateFilters('type', searchParams.get('type') === type ? null : type)
                }
                className="text-brand-primary focus:ring-brand-primary h-4 w-4 cursor-pointer rounded border-gray-300"
              />
              <span className="group-hover:text-brand-primary text-sm text-gray-600 transition-colors">
                {type}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Normes API */}
      <div>
        <h3 className="font-display text-brand-primary border-brand-surface-dark mb-4 border-b pb-2 font-semibold">
          Normes API
        </h3>
        <div className="custom-scrollbar flex max-h-[120px] flex-col gap-2 overflow-y-auto">
          {[
            'API SL',
            'API SM',
            'API SN',
            'API SP',
            'API CF',
            'API CI-4',
            'API CJ-4',
            'API CK-4',
          ].map((norm) => (
            <label key={norm} className="group flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={searchParams.get('api') === norm}
                onChange={() =>
                  updateFilters('api', searchParams.get('api') === norm ? null : norm)
                }
                className="text-brand-primary focus:ring-brand-primary h-4 w-4 cursor-pointer rounded border-gray-300"
              />
              <span className="group-hover:text-brand-primary text-sm text-gray-600 transition-colors">
                {norm}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Normes ACEA */}
      <div>
        <h3 className="font-display text-brand-primary border-brand-surface-dark mb-4 border-b pb-2 font-semibold">
          Normes ACEA
        </h3>
        <div className="custom-scrollbar flex max-h-[120px] flex-col gap-2 overflow-y-auto">
          {[
            'ACEA A3/B4',
            'ACEA C2',
            'ACEA C3',
            'ACEA C4',
            'ACEA C5',
            'ACEA E4',
            'ACEA E6',
            'ACEA E7',
            'ACEA E9',
          ].map((norm) => (
            <label key={norm} className="group flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={searchParams.get('acea') === norm}
                onChange={() =>
                  updateFilters('acea', searchParams.get('acea') === norm ? null : norm)
                }
                className="text-brand-primary focus:ring-brand-primary h-4 w-4 cursor-pointer rounded border-gray-300"
              />
              <span className="group-hover:text-brand-primary text-sm text-gray-600 transition-colors">
                {norm}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Emballage */}
      <div>
        <h3 className="font-display text-brand-primary border-brand-surface-dark mb-4 border-b pb-2 font-semibold">
          Emballage
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {['1L', '2L', '4L', '5L', '20L', '60L', '209L'].map((vol) => (
            <button
              key={vol}
              onClick={() =>
                updateFilters('volume', searchParams.get('volume') === vol ? null : vol)
              }
              className={`rounded border px-2 py-1.5 text-center text-xs transition-colors ${
                searchParams.get('volume') === vol
                  ? 'bg-brand-primary border-brand-primary text-white'
                  : 'hover:border-brand-primary border-gray-200 bg-white text-gray-600'
              }`}
            >
              {vol}
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div>
        <h3 className="font-display text-brand-primary border-brand-surface-dark mb-4 border-b pb-2 font-semibold">
          Options
        </h3>
        <div className="space-y-3">
          <label className="group flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => updateFilters('inStockOnly', e.target.checked ? 'true' : null)}
              className="text-brand-primary focus:ring-brand-primary h-4 w-4 cursor-pointer rounded border-gray-300"
            />
            <span className="group-hover:text-brand-primary text-sm text-gray-600 transition-colors">
              En stock uniquement
            </span>
          </label>
          <label className="group flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={isPromo}
              onChange={(e) => updateFilters('isPromo', e.target.checked ? 'true' : null)}
              className="text-brand-primary focus:ring-brand-primary h-4 w-4 cursor-pointer rounded border-gray-300"
            />
            <span className="group-hover:text-brand-primary text-sm text-gray-600 transition-colors">
              En promotion
            </span>
          </label>
        </div>
      </div>
    </div>
  )
}
