"use client";

import { useState } from 'react'
import { Search, Loader2, Tag, Layers } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { searchApi, type SuggestionProduct, type SuggestionCategory, type SuggestionBrand } from '@/lib/api/search'
import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { FormInput } from '../common/FormInput'
import { useTranslations } from 'next-intl'

export function MobileSearchSheet() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const t = useTranslations('Navigation')
  const tSearch = useTranslations('Search')
  
  const debouncedQuery = useDebounce(query, 300)

  // Use the richer /search/suggestions endpoint (products + categories + brands)
  const { data: suggestions, isFetching } = useQuery({
    queryKey: ['search-suggestions', debouncedQuery],
    queryFn: () => searchApi.suggestions(debouncedQuery),
    enabled: debouncedQuery.length > 2,
    staleTime: 1000 * 60 * 5,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setIsOpen(false)
      router.push(`/catalogue?search=${encodeURIComponent(query.trim())}`)
    }
  }

  const hasResults =
    (suggestions?.products?.length ?? 0) > 0 ||
    (suggestions?.categories?.length ?? 0) > 0 ||
    (suggestions?.brands?.length ?? 0) > 0

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        render={
          <button
            className="flex h-11 w-11 items-center justify-center rounded-lg text-brand-primary/70 transition-colors duration-200 hover:bg-brand-primary/5 hover:text-brand-primary lg:hidden"
            aria-label={t('search')}
          />
        }
      >
        <Search size={22} />
      </SheetTrigger>
      
      <SheetContent side="top" className="h-full max-h-[80vh] w-full p-0 flex flex-col sm:max-w-none rounded-b-2xl">
        <div className="p-4 border-b border-brand-border">
          <SheetTitle className="sr-only">{tSearch('ariaLabel')}</SheetTitle>
          <form onSubmit={handleSearch} className="relative mt-2">
            <FormInput
              id="mobile-search"
              label=""
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tSearch('placeholder')}
              icon={<Search size={18} />}
            />
            {isFetching && (
              <div className="absolute top-1/2 right-3 -translate-y-1/2">
                <Loader2 size={16} className="animate-spin text-brand-accent" />
              </div>
            )}
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {query.length > 2 ? (
            hasResults ? (
              <div className="flex flex-col gap-1">

                {/* Categories */}
                {(suggestions?.categories?.length ?? 0) > 0 && (
                  <div className="mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                      <Layers size={11} /> {tSearch('suggestedCategories') ?? 'Catégories'}
                    </span>
                    {suggestions!.categories.slice(0, 2).map((cat: SuggestionCategory) => (
                      <Link
                        key={cat.id}
                        href={`/categorie/${cat.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 rounded-xl border border-brand-border bg-brand-surface p-3 mb-1 text-sm font-medium text-brand-primary transition-colors hover:bg-white"
                      >
                        <span className="h-2 w-2 rounded-full bg-brand-accent/60 shrink-0" />
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Brands */}
                {(suggestions?.brands?.length ?? 0) > 0 && (
                  <div className="mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                      <Tag size={11} /> {tSearch('suggestedBrands') ?? 'Marques'}
                    </span>
                    {suggestions!.brands.slice(0, 2).map((brand: SuggestionBrand) => (
                      <Link
                        key={brand.id}
                        href={`/marque/${brand.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 rounded-xl border border-brand-border bg-brand-surface p-3 mb-1 text-sm font-medium text-brand-primary transition-colors hover:bg-white"
                      >
                        <span className="h-2 w-2 rounded-full bg-blue-400/70 shrink-0" />
                        {brand.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Products */}
                {(suggestions?.products?.length ?? 0) > 0 && (
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 block">
                      {tSearch('suggestedResults')}
                    </span>
                    <div className="flex flex-col gap-2">
                      {suggestions!.products.slice(0, 5).map((product: SuggestionProduct) => (
                        <Link
                          key={product.id}
                          href={`/produit/${product.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="group flex items-center gap-4 rounded-xl border border-brand-border bg-brand-surface p-3 transition-colors active:bg-white"
                        >
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white">
                            {product.image ? (
                              <Image src={product.image} alt={product.name} fill className="object-cover" />
                            ) : (
                              <div className="h-full w-full bg-gray-200" />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-sm font-semibold text-brand-primary truncate">
                              {product.name}
                            </span>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              {product.brandName && (
                                <span className="text-xs text-brand-accent font-bold uppercase tracking-wider">
                                  {product.brandName}
                                </span>
                              )}
                              {product.viscosity && (
                                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-700">
                                  {product.viscosity}
                                </span>
                              )}
                              {product.oemApprovals && (
                                <span className="rounded bg-blue-50 border border-blue-200 px-1.5 py-0.5 text-[9px] font-semibold text-blue-700 truncate max-w-[170px]" title={product.oemApprovals}>
                                  {product.oemApprovals.split(';')[0]?.trim()}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                
                <button
                  onClick={handleSearch}
                  className="btn-secondary mt-4 w-full"
                >
                  {tSearch('viewAllResults')}
                </button>
              </div>
            ) : !isFetching ? (
              <div className="py-12 px-4 text-center">
                <p className="text-brand-primary font-bold text-lg mb-2">{tSearch('noResult')}</p>
                <p className="text-brand-muted text-sm">{tSearch('tryOtherKeywords')}</p>
              </div>
            ) : null
          ) : (
            <div className="py-8 text-center">
              <Search size={48} className="mx-auto mb-4 text-brand-border" />
              <p className="text-brand-muted text-sm">{tSearch('minChars')}</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
