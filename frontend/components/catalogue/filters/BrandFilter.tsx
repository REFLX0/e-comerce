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
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40"
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
          className="h-9 w-full rounded-lg border border-white/10 bg-white/5 pl-8 pr-3 text-xs font-semibold text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#D4A76A]"
        />
      </div>

      <ul className="max-h-56 space-y-1 overflow-y-auto pr-1">
        {filtered.slice(0, visibleCount).map((brand) => {
          const isSelected = selected.includes(brand.slug)
          return (
            <li key={brand.id}>
              <label className="group flex min-h-9 cursor-pointer items-center gap-3 rounded-xl px-2 py-1 transition-all hover:bg-white/5">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isSelected}
                  onChange={() => toggle(brand.slug)}
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200',
                    isSelected
                      ? 'border-[#D4A76A] bg-[#D4A76A] text-[#16254c] shadow-[0_0_10px_rgba(212,167,106,0.3)]'
                      : 'border-white/20 bg-white/5 text-transparent group-hover:border-white/40 group-hover:bg-white/10'
                  )}
                >
                  <Check
                    size={13}
                    strokeWidth={3.5}
                    className={cn(
                      'transition-transform duration-200',
                      isSelected ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                    )}
                  />
                </span>
                <span
                  className={cn(
                    'min-w-0 flex-1 truncate text-[13px] transition-colors',
                    isSelected
                      ? 'font-bold text-white'
                      : 'text-white/70 group-hover:text-white'
                  )}
                >
                  {brand.name}
                </span>
              </label>
            </li>
          )
        })}
        {filtered.length === 0 && (
          <li className="px-2 py-3 text-xs text-white/50">{t('noResults')}</li>
        )}
      </ul>

      {filtered.length > visibleCount && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-3 text-[11px] font-black uppercase tracking-wide text-[#D4A76A] outline-none transition-colors hover:text-[#e8b975] focus-visible:ring-2 focus-visible:ring-[#D4A76A]/30"
        >
          {expanded ? t('showLess') : t('showMore')}
        </button>
      )}
    </div>
  )
}