'use client'

import { useMemo, useState } from 'react'
import { Check, Search } from 'lucide-react'
import type { FacetBrand } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

const INITIAL_VISIBLE = 8

interface BrandFilterProps {
  brands: FacetBrand[]
  selected: string[]
  onChange: (slugs: string[]) => void
}

/**
 * Multi-select brand list with inline search and "show more / show less".
 * Checkbox rows keep native inputs for screen readers and keyboard support.
 */
export function BrandFilter({ brands, selected, onChange }: BrandFilterProps) {
  const t = useTranslations('Catalogue')
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase()
    if (!q) return brands
    return brands.filter((brand) =>
      brand.name.toLocaleLowerCase().includes(q)
    )
  }, [brands, query])

  const visibleCount = expanded
    ? filtered.length
    : Math.max(
        INITIAL_VISIBLE,
        ...filtered.map((brand, index) =>
          selected.includes(brand.slug) ? index + 1 : 0
        )
      )

  const toggle = (slug: string) => {
    onChange(
      selected.includes(slug)
        ? selected.filter((item) => item !== slug)
        : [...selected, slug]
    )
  }

  return (
    <div>
      <div className="relative mb-3">
        <Search
          aria-hidden="true"
          size={14}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <label htmlFor="brand-filter-search" className="sr-only">
          {t('searchBrands')}
        </label>
        <input
          id="brand-filter-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('searchBrands')}
          className="h-9 w-full border border-black/15 bg-white pl-8 pr-3 text-xs font-semibold text-[#111] outline-none transition-colors placeholder:text-neutral-400 focus:border-[#E10600]"
        />
      </div>

      <ul className="max-h-56 space-y-0.5 overflow-y-auto pr-1">
        {filtered.slice(0, visibleCount).map((brand) => {
          const isSelected = selected.includes(brand.slug)
          return (
            <li key={brand.id}>
              <label className="group flex min-h-9 cursor-pointer items-center gap-2.5 rounded-sm px-1.5 transition-colors hover:bg-neutral-50">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isSelected}
                  onChange={() => toggle(brand.slug)}
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center border transition-colors',
                    isSelected
                      ? 'border-[#E10600] bg-[#E10600] text-white'
                      : 'border-black/20 bg-white group-hover:border-[#E10600]/60'
                  )}
                >
                  <Check
                    size={11}
                    strokeWidth={3.5}
                    className={cn(
                      'transition-transform duration-150',
                      isSelected ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                    )}
                  />
                </span>
                <span
                  className={cn(
                    'min-w-0 flex-1 truncate text-[13px]',
                    isSelected
                      ? 'font-bold text-[#111]'
                      : 'text-neutral-600 group-hover:text-[#111]'
                  )}
                >
                  {brand.name}
                </span>
                <span className="text-[11px] font-semibold text-neutral-400">
                  {brand.count}
                </span>
              </label>
            </li>
          )
        })}
        {filtered.length === 0 && (
          <li className="px-2 py-3 text-xs text-neutral-400">{t('noResults')}</li>
        )}
      </ul>

      {filtered.length > visibleCount && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-2 text-[11px] font-black uppercase tracking-wide text-[#E10600] outline-none transition-colors hover:text-[#bd0500] focus-visible:ring-2 focus-visible:ring-[#E10600]/30"
        >
          {expanded ? t('showLess') : t('showMore')}
        </button>
      )}
    </div>
  )
}