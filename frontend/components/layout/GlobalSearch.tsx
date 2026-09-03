"use client";

import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, X, Sparkles, Tag, Layers } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { searchApi, type SuggestionProduct, type SuggestionCategory, type SuggestionBrand } from '@/lib/api/search'
import { productsApi } from '@/lib/api/products'
import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { useTranslations } from 'next-intl'

interface GlobalSearchProps {
  className?: string
}

export function GlobalSearch({ className }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('Search')
  
  const debouncedQuery = useDebounce(query, 300)

  // Use the richer /search/suggestions endpoint (products + categories + brands)
  const { data: suggestions, isFetching } = useQuery({
    queryKey: ['search-suggestions', debouncedQuery],
    queryFn: () => searchApi.suggestions(debouncedQuery),
    enabled: debouncedQuery.length > 2,
    staleTime: 1000 * 60 * 5,
  })

  const { data: fallbackProducts } = useQuery({
    queryKey: ['search-fallback'],
    queryFn: () => productsApi.getBestSellers(3),
    staleTime: 1000 * 60 * 5,
  })

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setIsOpen(false)
      router.push(`/catalogue?search=${encodeURIComponent(query.trim())}`)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setIsOpen(false)
  }

  const hasResults =
    (suggestions?.products?.length ?? 0) > 0 ||
    (suggestions?.categories?.length ?? 0) > 0 ||
    (suggestions?.brands?.length ?? 0) > 0

  return (
    <div ref={searchRef} className={`relative z-50 flex-1 ${className ?? ''}`}>
      <form onSubmit={handleSearch} className="w-full relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={t('placeholder')}
          className="w-full rounded-lg border border-brand-border bg-brand-surface px-4 py-2.5 pr-12 text-sm text-brand-primary placeholder:text-brand-muted
                     transition-all duration-200 outline-none
                     focus:border-brand-primary/30 focus:bg-brand-card focus:ring-2 focus:ring-brand-primary/10"
          aria-label={t('ariaLabel')}
        />
        <div className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="flex h-8 w-8 items-center justify-center rounded-md text-brand-muted transition-colors duration-150 hover:bg-brand-primary/5 hover:text-brand-primary"
            >
              <X size={14} />
            </button>
          )}
          <button
            type="submit"
            className="flex h-8 w-8 items-center justify-center rounded-md text-brand-muted transition-colors duration-150 hover:bg-brand-primary/5 hover:text-brand-primary"
            aria-label={t('ariaLabel')}
          >
            {isFetching ? <Loader2 size={17} className="animate-spin text-brand-muted" /> : <Search size={17} />}
          </button>
        </div>
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && query.length > 2 && (
        <div className="animate-in fade-in slide-in-from-top-2 absolute top-full right-0 left-0 mt-2 overflow-hidden rounded-lg border border-brand-border bg-brand-card shadow-overlay duration-200">
          <div className="p-2">
            {isFetching ? (
              <div className="flex items-center justify-center py-8 text-gray-400">
                <Loader2 size={24} className="animate-spin text-brand-primary" />
              </div>
            ) : hasResults ? (
              <div className="flex flex-col gap-1">

                {/* Categories */}
                {(suggestions?.categories?.length ?? 0) > 0 && (
                  <div>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      <Layers size={11} /> {t('suggestedCategories') ?? 'Catégories'}
                    </span>
                    {suggestions!.categories.slice(0, 2).map((cat: SuggestionCategory) => (
                      <Link
                        key={cat.id}
                        href={`/categorie/${cat.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand-primary transition-colors hover:bg-brand-surface"
                      >
                        <span className="h-2 w-2 rounded-full bg-brand-accent/60" />
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Brands */}
                {(suggestions?.brands?.length ?? 0) > 0 && (
                  <div>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      <Tag size={11} /> {t('suggestedBrands') ?? 'Marques'}
                    </span>
                    {suggestions!.brands.slice(0, 2).map((brand: SuggestionBrand) => (
                      <Link
                        key={brand.id}
                        href={`/marque/${brand.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand-primary transition-colors hover:bg-brand-surface"
                      >
                        <span className="h-2 w-2 rounded-full bg-blue-400/70" />
                        {brand.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Products */}
                {(suggestions?.products?.length ?? 0) > 0 && (
                  <div>
                    <span className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                      {t('suggestedProducts')}
                    </span>
                    {suggestions!.products.slice(0, 5).map((product: SuggestionProduct) => (
                      <Link
                        key={product.id}
                        href={`/produit/${product.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="group/item flex items-center gap-3 rounded-lg p-2 transition-colors duration-150 hover:bg-brand-surface"
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-brand-surface">
                          {product.image ? (
                            <Image src={product.image} alt={product.name} fill className="object-cover" />
                          ) : (
                            <div className="h-full w-full bg-gray-200" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm font-semibold text-brand-primary truncate group-hover/item:text-brand-primary/70 transition-colors">
                            {product.name}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            {product.brandName && (
                              <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
                                {product.brandName}
                              </span>
                            )}
                            {product.viscosity && (
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                                {product.viscosity}
                              </span>
                            )}
                            {product.oemApprovals && (
                              <span className="rounded bg-blue-50 border border-blue-200 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 truncate max-w-[200px]" title={product.oemApprovals}>
                                {product.oemApprovals.split(';')[0]?.trim()}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                
                <button
                  onClick={handleSearch}
                  className="mt-2 min-h-11 w-full rounded-lg bg-brand-surface py-2 text-center text-sm font-bold text-brand-primary transition-colors duration-150 hover:bg-brand-surface-dark"
                >
                  {t('viewAllResults')}
                </button>
              </div>
            ) : (
              <div>
                <div className="py-6 px-4 text-center border-b border-brand-border/50">
                  <p className="text-gray-900 font-medium text-sm mb-1">{t('noResultsFor', { query })}</p>
                  <p className="text-gray-500 text-xs">{t('tryOtherKeywords')}</p>
                </div>
                {fallbackProducts && fallbackProducts.length > 0 && (
                  <div className="p-2">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-brand-primary/60 uppercase tracking-wider px-3 py-2">
                      <Sparkles size={12} /> {t('popularProducts')}
                    </span>
                    {fallbackProducts.map((product) => (
                      <Link
                        key={product.id}
                        href={`/produit/${product.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="group/item flex items-center gap-3 rounded-lg p-2 transition-colors duration-150 hover:bg-brand-surface"
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-brand-surface">
                          {product.images?.[0] ? (
                            <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                          ) : (
                            <div className="h-full w-full bg-gray-200" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-brand-primary truncate group-hover/item:text-brand-primary/70 transition-colors">
                            {product.name}
                          </span>
                          {product.brand && (
                            <span className="text-xs text-gray-500 uppercase tracking-widest font-medium">
                              {product.brand.name}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
