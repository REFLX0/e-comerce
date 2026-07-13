"use client";

import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/lib/api/categories'
import { brandsApi } from '@/lib/api/brands'
import { useRouter, useSearchParams } from 'next/navigation'
import { FilterSidebarSkeleton } from '../common/Skeleton'
import { FilterCheckbox } from './FilterCheckbox'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { RotateCcw } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function FilterSidebar() {
  const t = useTranslations('Catalogue')
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

  const clearAllFilters = () => {
    router.push('/catalogue')
  }

  const currentCategory = searchParams.get('categorySlug') || ''
  const currentBrand = searchParams.get('brandSlug') || ''
  const inStockOnly = searchParams.get('inStockOnly') === 'true'
  const isPromo = searchParams.get('isPromo') === 'true'

  if (catLoading || brandsLoading) {
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

      <Accordion defaultValue={['categories', 'brands']} className="w-full px-4">
        {/* Categories */}
        <AccordionItem value="categories">
          <AccordionTrigger className="font-display text-[#111] uppercase tracking-wider text-sm font-bold">
            {t('categories')}
          </AccordionTrigger>
          <AccordionContent>
            <ul className="custom-scrollbar max-h-[250px] space-y-2 overflow-y-auto pr-2 mt-1">
              <li>
                <button
                  onClick={() => updateFilters('categorySlug', null)}
                  className={`hover:text-[#E10600] hover:translate-x-1 flex w-full text-left text-sm transition-all ${
                    !currentCategory ? 'text-[#111] font-bold' : 'text-gray-500'
                  }`}
                >
                  Toutes les catégories
                </button>
              </li>
              {categories?.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => updateFilters('categorySlug', cat.slug)}
                    className={`hover:text-[#E10600] hover:translate-x-1 flex w-full justify-between text-left text-sm transition-all ${
                      currentCategory === cat.slug ? 'text-[#111] font-bold' : 'text-gray-500'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className="bg-gray-100 text-[#111] ml-2 rounded-md px-1.5 py-0.5 text-[10px] font-semibold opacity-70">
                      {cat.productCount}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>

        {/* Brands */}
        <AccordionItem value="brands">
          <AccordionTrigger className="font-display text-[#111] uppercase tracking-wider text-sm font-bold">
            {t('brands')}
          </AccordionTrigger>
          <AccordionContent>
            <ul className="custom-scrollbar max-h-[250px] space-y-2 overflow-y-auto pr-2 mt-1">
              <li>
                <button
                  onClick={() => updateFilters('brandSlug', null)}
                  className={`hover:text-[#E10600] hover:translate-x-1 flex w-full text-left text-sm transition-all ${
                    !currentBrand ? 'text-[#111] font-bold' : 'text-gray-500'
                  }`}
                >
                  Toutes les marques
                </button>
              </li>
              {brands?.map((brand) => (
                <li key={brand.id}>
                  <button
                    onClick={() => updateFilters('brandSlug', brand.slug)}
                    className={`hover:text-[#E10600] hover:translate-x-1 flex w-full justify-between text-left text-sm transition-all ${
                      currentBrand === brand.slug ? 'text-[#111] font-bold' : 'text-gray-500'
                    }`}
                  >
                    <span className="truncate">{brand.name}</span>
                    <span className="bg-gray-100 text-[#111] ml-2 rounded-md px-1.5 py-0.5 text-[10px] font-semibold opacity-70">
                      {brand.productCount}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>

        {/* Viscosity */}
        <AccordionItem value="viscosity">
          <AccordionTrigger className="font-display text-[#111] uppercase tracking-wider text-sm font-bold">
            {t('viscosity')}
          </AccordionTrigger>
          <AccordionContent>
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
                        ? 'bg-[#E10600] border-[#E10600] text-white shadow-sm'
                        : 'hover:border-gray-400 border-gray-200 bg-gray-50 text-[#111] hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    {visc}
                  </button>
                )
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Type d'huile */}
        <AccordionItem value="type">
          <AccordionTrigger className="font-display text-[#111] uppercase tracking-wider text-sm font-bold">
            {t('oilType')}
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-3 mt-1">
              {[
                '100% Synthèse',
                'Minérale',
                'Semi-Synthèse',
                'Synthèse',
                'Technologie de Synthèse',
              ].map((type) => (
                <FilterCheckbox
                  key={type}
                  label={type}
                  checked={searchParams.get('type') === type}
                  onChange={(checked) => updateFilters('type', checked ? type : null)}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Normes API */}
        <AccordionItem value="api">
          <AccordionTrigger className="font-display text-[#111] uppercase tracking-wider text-sm font-bold">
            {t('apiStandards')}
          </AccordionTrigger>
          <AccordionContent>
            <div className="custom-scrollbar flex max-h-[150px] flex-col gap-3 overflow-y-auto pr-2 mt-1">
              {[
                'API SL', 'API SM', 'API SN', 'API SP',
                'API CF', 'API CI-4', 'API CJ-4', 'API CK-4',
              ].map((norm) => (
                <FilterCheckbox
                  key={norm}
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
