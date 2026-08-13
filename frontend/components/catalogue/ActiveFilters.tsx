"use client"

import { useRouter } from '@/i18n/routing'
import { useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'

const FILTER_LABELS: Record<string, string> = {
  categorySlug: 'categoryFilter',
  brandSlug: 'brandFilter',
  viscosity: 'viscosityFilter',
  volume: 'volumeFilter',
  type: 'oilTypeFilter',
  api: 'apiFilter',
  acea: 'aceaFilter',
  priceMin: 'minPriceFilter',
  priceMax: 'maxPriceFilter',
  inStockOnly: 'inStockOnly',
  isNew: 'newArrivals',
  isFeatured: 'featuredProducts',
  search: 'searchFilter',
}

export function ActiveFilters() {
  const t = useTranslations('Catalogue')
  const router = useRouter()
  const searchParams = useSearchParams()

  const activeFilters: { key: string; label: string }[] = []
  for (const [key, value] of searchParams.entries()) {
    const translationKey = FILTER_LABELS[key]
    if (key === 'page' || !translationKey || !value) continue
    activeFilters.push({
      key,
      label:
        key === 'inStockOnly' || key === 'isNew' || key === 'isFeatured'
          ? t(translationKey)
          : `${t(translationKey)}: ${value}`,
    })
  }

  if (!activeFilters.length) return null

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(key)
    params.delete('page')
    router.push(`/catalogue?${params.toString()}`)
  }

  const clearAll = () => router.push('/catalogue')

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 border-y border-black/10 py-4">
      <span className="mr-1 text-[11px] font-black uppercase tracking-[0.15em] text-neutral-500">{t('activeFilters')}</span>
      {activeFilters.map((filter) => (
        <button
          key={filter.key}
          type="button"
          onClick={() => removeFilter(filter.key)}
          className="inline-flex items-center gap-1.5 border border-[#E10600]/20 bg-[#E10600]/[0.06] px-2.5 py-1.5 text-xs font-bold text-[#111] transition-colors hover:border-[#E10600] hover:bg-[#E10600] hover:text-white"
        >
          {filter.label}
          <X size={13} />
        </button>
      ))}
      <button type="button" onClick={clearAll} className="ml-1 text-xs font-bold text-[#E10600] hover:underline">
        {t('clearAllFilters')}
      </button>
    </div>
  )
}
