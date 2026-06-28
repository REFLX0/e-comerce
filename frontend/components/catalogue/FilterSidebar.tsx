'use client'

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
    <div className="w-full space-y-8 bg-white p-6 rounded-2xl border border-brand-surface-dark shadow-sm">
      {/* Categories */}
      <div>
        <h3 className="font-display font-semibold text-brand-primary mb-4 pb-2 border-b border-brand-surface-dark">
          Catégories
        </h3>
        <ul className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
          <li>
            <button
              onClick={() => updateFilters('categorySlug', null)}
              className={`text-sm text-left w-full hover:text-brand-accent transition-colors ${!currentCategory ? 'font-bold text-brand-primary' : 'text-gray-600'}`}
            >
              Toutes les catégories
            </button>
          </li>
          {categories?.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => updateFilters('categorySlug', cat.slug)}
                className={`text-sm text-left w-full hover:text-brand-accent transition-colors ${currentCategory === cat.slug ? 'font-bold text-brand-primary' : 'text-gray-600'}`}
              >
                {cat.name} <span className="text-gray-400 text-xs ml-1">({cat.productCount})</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Brands */}
      <div>
        <h3 className="font-display font-semibold text-brand-primary mb-4 pb-2 border-b border-brand-surface-dark">
          Marques
        </h3>
        <ul className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
          <li>
            <button
              onClick={() => updateFilters('brandSlug', null)}
              className={`text-sm text-left w-full hover:text-brand-accent transition-colors ${!currentBrand ? 'font-bold text-brand-primary' : 'text-gray-600'}`}
            >
              Toutes les marques
            </button>
          </li>
          {brands?.map((brand) => (
            <li key={brand.id}>
              <button
                onClick={() => updateFilters('brandSlug', brand.slug)}
                className={`text-sm text-left w-full hover:text-brand-accent transition-colors ${currentBrand === brand.slug ? 'font-bold text-brand-primary' : 'text-gray-600'}`}
              >
                {brand.name} <span className="text-gray-400 text-xs ml-1">({brand.productCount})</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Viscosity (Hardcoded for demo, normally from API) */}
      <div>
        <h3 className="font-display font-semibold text-brand-primary mb-4 pb-2 border-b border-brand-surface-dark">
          Viscosité
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
          {["0W20", "0W30", "0W40", "5W20", "5W30", "5W40", "10W40", "10W60", "15W40", "15W50", "20W50", "75W80", "75W90", "80W90", "85W140", "ATF", "CVT", "DCT", "DOT 4", "DOT 5.1", "LHM", "SAE 30", "ISO VG 46", "ISO VG 68"].map((visc) => (
            <button
              key={visc}
              onClick={() => updateFilters('viscosity', searchParams.get('viscosity') === visc ? null : visc)}
              className={`text-[10px] py-1.5 px-1 rounded border text-center transition-colors truncate ${
                searchParams.get('viscosity') === visc 
                  ? 'bg-brand-primary border-brand-primary text-white' 
                  : 'bg-white border-gray-200 text-gray-600 hover:border-brand-primary'
              }`}
            >
              {visc}
            </button>
          ))}
        </div>
      </div>

      {/* Type d'huile */}
      <div>
        <h3 className="font-display font-semibold text-brand-primary mb-4 pb-2 border-b border-brand-surface-dark">
          Type d'huile
        </h3>
        <div className="flex flex-col gap-2">
          {["100% Synthèse", "Minérale", "Semi-Synthèse", "Synthèse", "Technologie de Synthèse"].map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={searchParams.get('type') === type}
                onChange={() => updateFilters('type', searchParams.get('type') === type ? null : type)}
                className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
              />
              <span className="text-sm text-gray-600 group-hover:text-brand-primary transition-colors">
                {type}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Normes API */}
      <div>
        <h3 className="font-display font-semibold text-brand-primary mb-4 pb-2 border-b border-brand-surface-dark">
          Normes API
        </h3>
        <div className="flex flex-col gap-2 max-h-[120px] overflow-y-auto custom-scrollbar">
          {["API SL", "API SM", "API SN", "API SP", "API CF", "API CI-4", "API CJ-4", "API CK-4"].map((norm) => (
            <label key={norm} className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={searchParams.get('api') === norm}
                onChange={() => updateFilters('api', searchParams.get('api') === norm ? null : norm)}
                className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
              />
              <span className="text-sm text-gray-600 group-hover:text-brand-primary transition-colors">
                {norm}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Normes ACEA */}
      <div>
        <h3 className="font-display font-semibold text-brand-primary mb-4 pb-2 border-b border-brand-surface-dark">
          Normes ACEA
        </h3>
        <div className="flex flex-col gap-2 max-h-[120px] overflow-y-auto custom-scrollbar">
          {["ACEA A3/B4", "ACEA C2", "ACEA C3", "ACEA C4", "ACEA C5", "ACEA E4", "ACEA E6", "ACEA E7", "ACEA E9"].map((norm) => (
            <label key={norm} className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={searchParams.get('acea') === norm}
                onChange={() => updateFilters('acea', searchParams.get('acea') === norm ? null : norm)}
                className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
              />
              <span className="text-sm text-gray-600 group-hover:text-brand-primary transition-colors">
                {norm}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Emballage */}
      <div>
        <h3 className="font-display font-semibold text-brand-primary mb-4 pb-2 border-b border-brand-surface-dark">
          Emballage
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {["1L", "2L", "4L", "5L", "20L", "60L", "209L"].map((vol) => (
            <button
              key={vol}
              onClick={() => updateFilters('volume', searchParams.get('volume') === vol ? null : vol)}
              className={`text-xs py-1.5 px-2 rounded border text-center transition-colors ${
                searchParams.get('volume') === vol 
                  ? 'bg-brand-primary border-brand-primary text-white' 
                  : 'bg-white border-gray-200 text-gray-600 hover:border-brand-primary'
              }`}
            >
              {vol}
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div>
        <h3 className="font-display font-semibold text-brand-primary mb-4 pb-2 border-b border-brand-surface-dark">
          Options
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={inStockOnly}
              onChange={(e) => updateFilters('inStockOnly', e.target.checked ? 'true' : null)}
              className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
            />
            <span className="text-sm text-gray-600 group-hover:text-brand-primary transition-colors">
              En stock uniquement
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={isPromo}
              onChange={(e) => updateFilters('isPromo', e.target.checked ? 'true' : null)}
              className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
            />
            <span className="text-sm text-gray-600 group-hover:text-brand-primary transition-colors">
              En promotion
            </span>
          </label>
        </div>
      </div>
    </div>
  )
}
