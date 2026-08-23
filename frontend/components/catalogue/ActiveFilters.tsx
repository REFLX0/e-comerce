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
    <div className="mb-6 flex flex-wrap items-center gap-2.5 border-y border-black/5 py-4">
      <span className="mr-1 text-[11px] font-black uppercase tracking-[0.15em] text-neutral-400">
        {t('activeFilters')}
      </span>
      {activeChips.map((chip) => (
        <button
          key={`${chip.key}-${chip.label}`}
          type="button"
          onClick={() => removeFilter(chip.key)}
          className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-[#0a1128] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:border-[#D4A76A]/50 hover:bg-[#16254c] hover:text-[#D4A76A]"
        >
          {chip.label}
          <X size={13} aria-hidden="true" className="text-white/50" />
          <span className="sr-only">{t('removeFilter')}</span>
        </button>
      ))}
      <button
        type="button"
        onClick={clearAll}
        className="ml-2 text-xs font-black text-[#0a1128] underline underline-offset-4 hover:text-black transition-colors"
      >
        {t('clearAllFilters')}
      </button>
    </div>
  )
}