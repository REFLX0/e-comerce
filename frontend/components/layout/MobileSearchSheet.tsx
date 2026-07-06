"use client";

import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { productsApi } from '@/lib/api/products'
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
  
  const debouncedQuery = useDebounce(query, 300)

  const { data: results, isFetching } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => productsApi.search(debouncedQuery, 5),
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
          <SheetTitle className="sr-only">Rechercher</SheetTitle>
          <form onSubmit={handleSearch} className="relative mt-2">
            <FormInput
              id="mobile-search"
              label=""
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un produit, marque..."
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
            results && results.length > 0 ? (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Résultats suggérés
                </span>
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/produit/${product.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center gap-4 rounded-xl border border-brand-border bg-brand-surface p-3 transition-colors active:bg-white"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white">
                      {product.images?.[0] ? (
                        <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                      ) : (
                        <div className="h-full w-full bg-gray-200" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-brand-primary truncate">
                        {product.name}
                      </span>
                      {product.brand && (
                        <span className="text-xs text-brand-accent font-bold uppercase tracking-widest mt-1">
                          {product.brand.name}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
                
                <button
                  onClick={handleSearch}
                  className="btn-secondary mt-4 w-full"
                >
                  Voir tous les résultats
                </button>
              </div>
            ) : !isFetching ? (
              <div className="py-12 px-4 text-center">
                <p className="text-brand-primary font-bold text-lg mb-2">Aucun résultat</p>
                <p className="text-brand-muted text-sm">Essayez d'autres mots clés pour "{query}"</p>
              </div>
            ) : null
          ) : (
            <div className="py-8 text-center">
              <Search size={48} className="mx-auto mb-4 text-brand-border" />
              <p className="text-brand-muted text-sm">Saisissez au moins 3 caractères pour lancer la recherche</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
