"use client";

import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/lib/api/categories'
import { brandsApi } from '@/lib/api/brands'
import { useRouter, useSearchParams } from 'next/navigation'
import { FilterSidebarSkeleton } from '../common/Skeleton'
import { FilterCheckbox } from './FilterCheckbox'
import { RotateCcw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { productsApi } from '@/lib/api/products'

export function FilterSidebar() {
  const t = useTranslations('Catalogue')
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get('categorySlug') || ''
  const currentBrand = searchParams.get('brandSlug') || ''

  const { data: categories, isLoading: catLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  })

  const { data: facets, isLoading: facetsLoading } = useQuery({
    queryKey: ['facets', currentCategory, searchParams.get('search')],
    queryFn: () => productsApi.getFacets({ categorySlug: currentCategory, search: searchParams.get('search') || undefined }),
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

  const clearAllFilters = () => {
    router.push('/catalogue')
  }

  const inStockOnly = searchParams.get('inStockOnly') === 'true'
  const isPromo = searchParams.get('isPromo') === 'true'

  if (catLoading || facetsLoading) {
    return <FilterSidebarSkeleton />
  }

  // Count active filters (excluding page)
  const activeFiltersCount = Array.from(searchParams.keys()).filter((k) => k !== 'page' && k !== 'search').length

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 p-4">
        <h2 className="font-display text-lg font-bold text-[#111]">{t('filters')}</h2>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#E10600] transition-colors"
          >
            <RotateCcw size={12} />
            {t('clear')}
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-[#111]">
              {activeFiltersCount}
            </span>
          </button>
        )}
      </div>

      <div className="w-full px-4 py-4">
        {/* Brands Dropdown */}
        <div className="mb-8">
          <label className="mb-3 block font-display text-sm font-bold text-brand-primary">
            Filtré par Marque
          </label>
          <select
            className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-primary"
            value={currentBrand || ''}
            onChange={(e) => updateFilters('brandSlug', e.target.value || null)}
          >
            <option value="">Sélectionner une marque</option>
            {facets?.brands?.map((brand) => (
              <option key={brand.id} value={brand.slug}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        {/* Volumes */}
        {facets?.volumes && facets.volumes.length > 0 && (
          <div className="mb-8">
            <h3 className="mb-4 font-display text-sm font-bold text-brand-primary">
              Filtré par
            </h3>
            <ul className="space-y-3">
              {facets.volumes.map((v) => {
                const isActive = searchParams.get('volume') === v.volume
                return (
                  <li key={v.volume}>
                    <button
                      onClick={() => updateFilters('volume', isActive ? null : v.volume)}
                      className={`flex w-full items-center justify-between text-sm transition-colors hover:text-brand-accent ${
                        isActive ? 'font-bold text-brand-primary' : 'text-gray-600'
                      }`}
                    >
                      <span>{v.volume}</span>
                      <span className="text-gray-400">({v.count})</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Categories */}
        <div className="mb-8">
          <h3 className="mb-4 font-display text-sm font-bold text-brand-primary">
            {t('categories')}
          </h3>
          <ul className="space-y-3">
            <li>
              <button
                onClick={() => updateFilters('categorySlug', null)}
                className={`flex w-full text-left text-sm transition-all hover:text-brand-accent ${
                  !currentCategory ? 'text-brand-primary font-bold' : 'text-gray-600'
                }`}
              >
                Toutes les catégories
              </button>
            </li>
            {categories?.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => updateFilters('categorySlug', cat.slug)}
                  className={`flex w-full justify-between text-left text-sm transition-all hover:text-brand-accent ${
                    currentCategory === cat.slug ? 'text-brand-primary font-bold' : 'text-gray-600'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="text-gray-400">({cat.productCount})</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Viscosity */}
        <div className="mb-8">
          <h3 className="mb-4 font-display text-sm font-bold text-brand-primary">
            {t('viscosity')}
          </h3>
          <div className="custom-scrollbar grid max-h-[200px] grid-cols-3 gap-2 overflow-y-auto pr-2 mt-1">
            {[
              '0W20', '0W30', '0W40', '5W20', '5W30', '5W40',
              '10W40', '10W60', '15W40', '15W50', '20W50',
              '75W80', '75W90', '80W90', '85W140', 'ATF',
              'CVT', 'DCT', 'DOT 4', 'DOT 5.1', 'LHM',
              'SAE 30', 'ISO VG 46', 'ISO VG 68',
            ].map((visc) => {
              const isActive = searchParams.get('viscosity') === visc
              return (
                <button
                  key={visc}
                  onClick={() => updateFilters('viscosity', isActive ? null : visc)}
                  className={`truncate rounded-lg border px-1 py-1.5 text-center text-[10px] font-medium transition-all duration-200 active:scale-95 ${
                    isActive
                      ? 'bg-brand-primary border-brand-primary text-white shadow-sm'
                      : 'hover:border-gray-400 border-gray-200 bg-gray-50 text-brand-primary hover:bg-white hover:shadow-sm'
                  }`}
                >
                  {visc}
                </button>
              )
            })}
          </div>
        </div>

        {/* Type d'huile */}
        <div className="mb-8">
          <h3 className="mb-4 font-display text-sm font-bold text-brand-primary">
            {t('oilType')}
          </h3>
          <div className="flex flex-col gap-3">
            {['100% Synthèse', 'Minérale', 'Semi-Synthèse', 'Synthèse', 'Technologie de Synthèse'].map((type) => (
              <FilterCheckbox
                key={type}
                label={type}
                checked={searchParams.get('type') === type}
                onChange={(checked) => updateFilters('type', checked ? type : null)}
              />
            ))}
          </div>
        </div>

        {/* Normes API */}
        <div className="mb-8">
          <h3 className="mb-4 font-display text-sm font-bold text-brand-primary">
            {t('apiStandards')}
                  label={norm}
                  checked={searchParams.get('api') === norm}
                  onChange={(checked) => updateFilters('api', checked ? norm : null)}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Normes ACEA */}
        <AccordionItem value="acea">
          <AccordionTrigger className="font-display text-[#111] uppercase tracking-wider text-sm font-bold">
            {t('aceaStandards')}
          </AccordionTrigger>
          <AccordionContent>
            <div className="custom-scrollbar flex max-h-[150px] flex-col gap-3 overflow-y-auto pr-2 mt-1">
              {[
                'ACEA A3/B4', 'ACEA C2', 'ACEA C3', 'ACEA C4', 'ACEA C5',
                'ACEA E4', 'ACEA E6', 'ACEA E7', 'ACEA E9',
              ].map((norm) => (
                <FilterCheckbox
                  key={norm}
                  label={norm}
                  checked={searchParams.get('acea') === norm}
                  onChange={(checked) => updateFilters('acea', checked ? norm : null)}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Approbations OEM */}
        <AccordionItem value="oem">
          <AccordionTrigger className="font-display text-[#111] uppercase tracking-wider text-sm font-bold">
            {t('oemApprovals')}
          </AccordionTrigger>
          <AccordionContent>
            <div className="custom-scrollbar flex max-h-[150px] flex-col gap-3 overflow-y-auto pr-2 mt-1">
              {[
                'VW 504.00/507.00', 'VW 502.00/505.00', 'MB-Approval 229.51', 
                'MB-Approval 229.3', 'BMW Longlife-04', 'BMW Longlife-01',
                'Porsche C30', 'Porsche A40', 'Renault RN0700/RN0710',
                'Renault RN17', 'PSA B71 2290', 'Ford WSS-M2C913-D'
              ].map((oem) => (
                <FilterCheckbox
                  key={oem}
                  label={oem}
                  checked={searchParams.get('oem') === oem}
                  onChange={(checked) => updateFilters('oem', checked ? oem : null)}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Emballage */}
        <AccordionItem value="volume">
          <AccordionTrigger className="font-display text-[#111] uppercase tracking-wider text-sm font-bold">
            {t('packaging')}
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {['1L', '2L', '4L', '5L', '20L', '60L', '209L'].map((vol) => {
                const isActive = searchParams.get('volume') === vol
                return (
                  <button
                    key={vol}
                    onClick={() => updateFilters('volume', isActive ? null : vol)}
                    className={`rounded-lg border px-2 py-1.5 text-center text-[10px] font-medium transition-all duration-200 active:scale-95 ${
                      isActive
                        ? 'bg-[#E10600] border-[#E10600] text-white shadow-sm'
                        : 'hover:border-gray-400 border-gray-200 bg-gray-50 text-[#111] hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    {vol}
                  </button>
                )
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Options */}
        <AccordionItem value="options" className="border-none">
          <AccordionTrigger className="font-display text-[#111] uppercase tracking-wider text-sm font-bold">
            {t('options')}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 mt-1 pb-4">
              <FilterCheckbox
                label={t('inStockOnly')}
                checked={inStockOnly}
                onChange={(checked) => updateFilters('inStockOnly', checked ? 'true' : null)}
              />
              
              <FilterCheckbox
                label={t('onSale')}
                checked={isPromo}
                onChange={(checked) => updateFilters('isPromo', checked ? 'true' : null)}
                accentColor="accent"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
