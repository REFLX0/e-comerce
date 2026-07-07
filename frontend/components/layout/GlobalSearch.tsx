"use client";

import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, X, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { productsApi } from '@/lib/api/products'
import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { useDebounce } from '@/lib/hooks/useDebounce'

export function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  
  const debouncedQuery = useDebounce(query, 300)

  const { data: results, isFetching } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => productsApi.search(debouncedQuery, 5),
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

  return (
    <div ref={searchRef} className="relative z-50 hidden max-w-sm flex-1 lg:flex">
      <form onSubmit={handleSearch} className="w-full relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Rechercher un produit, marque..."
          className="w-full rounded-lg border border-brand-border bg-brand-surface px-4 py-2.5 pr-12 text-sm text-brand-primary placeholder:text-brand-muted
                     transition-all duration-200 outline-none
                     focus:border-brand-accent/60 focus:bg-brand-card focus:ring-2 focus:ring-brand-accent/20"
          aria-label="Rechercher"
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
            aria-label="Rechercher"
          >
            {isFetching ? <Loader2 size={17} className="animate-spin text-brand-accent" /> : <Search size={17} />}
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
            ) : results && results.length > 0 ? (
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">
                  Produits suggérés
                </span>
                {results.map((product) => (
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
                      <span className="text-sm font-semibold text-brand-primary truncate group-hover/item:text-brand-accent transition-colors">
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
                
                <button
                  onClick={handleSearch}
                  className="mt-2 min-h-11 w-full rounded-lg bg-brand-surface py-2 text-center text-sm font-bold text-brand-primary transition-colors duration-150 hover:bg-brand-surface-dark"
                >
                  Voir tous les résultats
                </button>
              </div>
            ) : (
              <div>
                <div className="py-6 px-4 text-center border-b border-brand-border/50">
                  <p className="text-gray-900 font-medium text-sm mb-1">Aucun résultat pour "{query}"</p>
                  <p className="text-gray-500 text-xs">Essayez d'autres mots clés</p>
                </div>
                {fallbackProducts && fallbackProducts.length > 0 && (
                  <div className="p-2">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-brand-primary/60 uppercase tracking-wider px-3 py-2">
                      <Sparkles size={12} /> Produits populaires
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
                          <span className="text-sm font-semibold text-brand-primary truncate group-hover/item:text-brand-accent transition-colors">
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
