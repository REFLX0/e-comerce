"use client"

import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/lib/api/categories'
import { productsApi } from '@/lib/api/products'
import { useRouter } from '@/i18n/routing'
import { useSearchParams } from 'next/navigation'
import { FilterSidebarSkeleton } from '../common/Skeleton'
import { FilterCheckbox } from './FilterCheckbox'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import { useTranslations } from 'next-intl'

const VISCOSITIES = [
  '0W20', '0W30', '0W40', '5W20', '5W30', '5W40', '10W40', '10W60',
  '15W40', '15W50', '20W50', '75W80', '75W90', '80W90', '85W140', 'ATF', 'CVT', 'DCT',
]

const OIL_TYPES = ['100% Synthèse', 'Semi-Synthèse', 'Minérale']
const API_STANDARDS = ['API SL', 'API SM', 'API SN', 'API SP', 'API CF', 'API CI-4', 'API CJ-4', 'API CK-4']
const ACEA_STANDARDS = ['ACEA A3/B4', 'ACEA C2', 'ACEA C3', 'ACEA C4', 'ACEA C5', 'ACEA E4', 'ACEA E6', 'ACEA E7', 'ACEA E9']

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
    queryFn: () =>
      productsApi.getFacets({
        categorySlug: currentCategory,
        search: searchParams.get('search') || undefined,
      }),
  })

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    router.push(`/catalogue?${params.toString()}`)
  }

  const clearAllFilters = () => router.push('/catalogue')
  const activeFiltersCount = Array.from(searchParams.keys()).filter(
    (key) => key !== 'page' && key !== 'search'
  ).length

  if (catLoading || facetsLoading) return <FilterSidebarSkeleton />

  return (
    <div className="overflow-hidden border border-black/10 bg-white shadow-[0_18px_45px_rgba(11,11,12,0.07)]">
      <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center bg-[#0B0B0C] text-white">
            <SlidersHorizontal size={15} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.16em] text-[#111]">{t('filters')}</h2>
            {activeFiltersCount > 0 && (
              <p className="mt-0.5 text-[11px] font-medium text-neutral-500">
                {t('filtersActive', { count: activeFiltersCount })}
              </p>
            )}
          </div>
        </div>
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#E10600] transition-colors hover:text-[#ab0500]"
          >
            <RotateCcw size={13} />
            {t('clear')}
          </button>
        )}
      </div>

      <div className="space-y-7 p-5">
        <section>
          <h3 className="mb-3 text-[11px] font-black uppercase tracking-[0.16em] text-neutral-500">
            {t('categories')}
          </h3>
          <div className="space-y-1">
            <FilterChoice
              label={t('allCategories')}
              active={!currentCategory}
              onClick={() => updateFilters('categorySlug', null)}
            />
            {categories?.map((category) => (
              <FilterChoice
                key={category.id}
                label={category.name}
                count={category.productCount}
                active={currentCategory === category.slug}
                onClick={() => updateFilters('categorySlug', category.slug)}
              />
            ))}
          </div>
        </section>

        <section>
          <label htmlFor="catalogue-brand" className="mb-3 block text-[11px] font-black uppercase tracking-[0.16em] text-neutral-500">
            {t('brands')}
          </label>
          <select
            id="catalogue-brand"
            className="h-11 w-full appearance-none rounded-none border border-black/15 bg-white px-3 text-sm font-semibold text-[#111] outline-none transition-colors focus:border-[#E10600]"
            value={currentBrand}
            onChange={(event) => updateFilters('brandSlug', event.target.value || null)}
          >
            <option value="">{t('selectBrand')}</option>
            {facets?.brands?.map((brand) => (
              <option key={brand.id} value={brand.slug}>
                {brand.name}
              </option>
            ))}
          </select>
        </section>

        <section>
          <h3 className="mb-3 text-[11px] font-black uppercase tracking-[0.16em] text-neutral-500">{t('price')}</h3>
          <div className="grid grid-cols-2 gap-2">
            <PriceInput
              label={t('priceMin')}
              value={searchParams.get('priceMin') || ''}
              onChange={(value) => updateFilters('priceMin', value)}
            />
            <PriceInput
              label={t('priceMax')}
              value={searchParams.get('priceMax') || ''}
              onChange={(value) => updateFilters('priceMax', value)}
            />
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-[11px] font-black uppercase tracking-[0.16em] text-neutral-500">{t('viscosity')}</h3>
          <div className="grid grid-cols-3 gap-1.5">
            {VISCOSITIES.map((viscosity) => {
              const isActive = searchParams.get('viscosity') === viscosity
              return (
                <button
                  key={viscosity}
                  type="button"
                  onClick={() => updateFilters('viscosity', isActive ? null : viscosity)}
                  className={`min-h-9 border px-1 text-[10px] font-black tracking-wide transition-colors ${
                    isActive
                      ? 'border-[#E10600] bg-[#E10600] text-white'
                      : 'border-black/10 bg-neutral-50 text-[#111] hover:border-black/35 hover:bg-white'
                  }`}
                >
                  {viscosity}
                </button>
              )
            })}
          </div>
        </section>

        {facets?.volumes?.length ? (
          <section>
            <h3 className="mb-3 text-[11px] font-black uppercase tracking-[0.16em] text-neutral-500">{t('packaging')}</h3>
            <div className="flex flex-wrap gap-1.5">
              {facets.volumes.map((volume) => {
                const isActive = searchParams.get('volume') === volume.volume
                return (
                  <button
                    key={volume.volume}
                    type="button"
                    onClick={() => updateFilters('volume', isActive ? null : volume.volume)}
                    className={`inline-flex min-h-8 items-center gap-1 border px-2.5 text-[10px] font-black tracking-wide transition-colors ${
                      isActive
                        ? 'border-[#E10600] bg-[#E10600] text-white'
                        : 'border-black/10 bg-white text-[#111] hover:border-black/35'
                    }`}
                  >
                    {volume.volume}
                    <span className={isActive ? 'text-white/70' : 'text-neutral-400'}>{volume.count}</span>
                  </button>
                )
              })}
            </div>
          </section>
        ) : null}

        <Accordion className="border-t border-black/10" defaultValue={['oil-type']}>
          <AccordionItem value="oil-type" className="border-black/10">
            <AccordionTrigger className="py-4 text-[11px] font-black uppercase tracking-[0.16em] text-[#111] hover:no-underline">
              {t('oilType')}
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-3">
                {OIL_TYPES.map((type) => (
                  <FilterCheckbox
                    key={type}
                    label={type}
                    checked={searchParams.get('type') === type}
                    onChange={(checked) => updateFilters('type', checked ? type : null)}
                    className="text-sm"
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          <FilterAccordion
            value="api"
            title={t('apiStandards')}
            options={API_STANDARDS}
            activeValue={searchParams.get('api')}
            onSelect={(value) => updateFilters('api', value)}
          />
          <FilterAccordion
            value="acea"
            title={t('aceaStandards')}
            options={ACEA_STANDARDS}
            activeValue={searchParams.get('acea')}
            onSelect={(value) => updateFilters('acea', value)}
          />
        </Accordion>

        <section className="border-t border-black/10 pt-5">
          <h3 className="mb-4 text-[11px] font-black uppercase tracking-[0.16em] text-neutral-500">{t('availability')}</h3>
          <div className="space-y-3.5">
            <FilterCheckbox
              label={t('inStockOnly')}
              checked={searchParams.get('inStockOnly') === 'true'}
              onChange={(checked) => updateFilters('inStockOnly', checked ? 'true' : null)}
            />
            <FilterCheckbox
              label={t('newArrivals')}
              checked={searchParams.get('isNew') === 'true'}
              onChange={(checked) => updateFilters('isNew', checked ? 'true' : null)}
            />
            <FilterCheckbox
              label={t('featuredProducts')}
              checked={searchParams.get('isFeatured') === 'true'}
              onChange={(checked) => updateFilters('isFeatured', checked ? 'true' : null)}
            />
          </div>
        </section>
      </div>
    </div>
  )
}

function FilterChoice({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count?: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-9 w-full items-center justify-between gap-3 border-l-2 px-3 text-left text-sm transition-colors ${
        active
          ? 'border-[#E10600] bg-[#E10600]/[0.06] font-bold text-[#111]'
          : 'border-transparent text-neutral-600 hover:border-black/25 hover:bg-neutral-50 hover:text-[#111]'
      }`}
    >
      <span className="truncate">{label}</span>
      {typeof count === 'number' && <span className="text-[11px] text-neutral-400">{count}</span>}
    </button>
  )
}

function PriceInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string | null) => void }) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        min="0"
        value={value}
        placeholder={label}
        onChange={(event) => onChange(event.target.value || null)}
        className="h-10 w-full border border-black/15 bg-white px-2.5 text-xs font-semibold text-[#111] outline-none transition-colors placeholder:text-neutral-400 focus:border-[#E10600]"
      />
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400">DT</span>
    </label>
  )
}

function FilterAccordion({
  value,
  title,
  options,
  activeValue,
  onSelect,
}: {
  value: string
  title: string
  options: string[]
  activeValue: string | null
  onSelect: (value: string | null) => void
}) {
  return (
    <AccordionItem value={value} className="border-black/10">
      <AccordionTrigger className="py-4 text-[11px] font-black uppercase tracking-[0.16em] text-[#111] hover:no-underline">
        {title}
      </AccordionTrigger>
      <AccordionContent className="pb-4">
        <div className="space-y-3">
          {options.map((option) => (
            <FilterCheckbox
              key={option}
              label={option}
              checked={activeValue === option}
              onChange={(checked) => onSelect(checked ? option : null)}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
