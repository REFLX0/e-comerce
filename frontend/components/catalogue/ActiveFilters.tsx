'use client'

import { useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useFilterParams } from '@/lib/hooks/useFilterParams'

const FILTER_LABELS: Record<string, string> = {
  categorySlug: 'categoryFilter',
  brandSlug: 'brandFilter',
  brands: 'brandFilter',
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
  const searchParams = useSearchParams()
  const { patchFilters, clearAll } = useFilterParams()

  const activeChips: { key: string; label: string }[] = []
  for (const [key, value] of searchParams.entries()) {
    const translationKey = FILTER_LABELS[key]
    if (key === 'page' || !translationKey || !value) continue

    const isToggle =
      key === 'inStockOnly' || key === 'isNew' || key === 'isFeatured'

    if (key === 'brands') {
      /* One chip per selected brand */
      value
        .split(',')
        .map((slug) => slug.trim())
        .filter(Boolean)
        .forEach((slug) =>
          activeChips.push({
            key,
            label: `${t(translationKey)}: ${slug}`,
          })
        )
      continue
    }

    activeChips.push({
      key,
      label: isToggle ? t(translationKey) : `${t(translationKey)}: ${value}`,
    })
  }

  if (!activeChips.length) return null

  const removeFilter = (key: string) => patchFilters({ [key]: null })

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 border-y border-black/10 py-4">
      <span className="mr-1 text-[11px] font-black uppercase tracking-[0.15em] text-neutral-500">
        {t('activeFilters')}
      </span>
      {activeChips.map((chip) => (
        <button
          key={`${chip.key}-${chip.label}`}
          type="button"
          onClick={() => removeFilter(chip.key)}
          className="inline-flex items-center gap-1.5 border border-[#E10600]/20 bg-[#E10600]/[0.06] px-2.5 py-1.5 text-xs font-bold text-[#111] transition-colors hover:border-[#E10600] hover:bg-[#E10600] hover:text-white"
        >
          {chip.label}
          <X size={13} aria-hidden="true" />
          <span className="sr-only">{t('removeFilter')}</span>
        </button>
      ))}
      <button
        type="button"
        onClick={clearAll}
        className="ml-1 text-xs font-bold text-[#E10600] hover:underline"
      >
        {t('clearAllFilters')}
      </button>
    </div>
  )
}