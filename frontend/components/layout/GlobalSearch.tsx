"use client";

import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, X } from 'lucide-react'
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
  
  // Debounce search query to avoid spamming the API
  const debouncedQuery = useDebounce(query, 300)

  const { data: results, isFetching } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => productsApi.search(debouncedQuery, 5),
    enabled: debouncedQuery.length > 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
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
    <div ref={searchRef} className="relative hidden max-w-sm flex-1 lg:flex z-50">
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
          className="w-full rounded-xl border border-white/10 bg-white/6 px-5 pr-12 py-2.5 text-sm text-white placeholder:text-white/40
                     transition-all duration-200 outline-none
                     focus:border-brand-accent/50 focus:bg-white/10 focus:ring-2 focus:ring-brand-accent/20"
          aria-label="Rechercher"
        />
        <div className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="p-1 text-white/40 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          )}
          <button
            type="submit"
            className="p-1 text-white/40 hover:text-brand-accent transition-colors"
            aria-label="Rechercher"
          >
            {isFetching ? <Loader2 size={17} className="animate-spin text-brand-accent" /> : <Search size={17} />}
          </button>
        </div>
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && query.length > 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
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
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group/item"
                  >
                    <div className="h-12 w-12 bg-gray-100 rounded-md overflow-hidden relative shrink-0">
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
                  className="mt-2 w-full py-2 text-center text-sm font-bold text-brand-primary bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Voir tous les résultats
                </button>
              </div>
            ) : (
              <div className="py-8 px-4 text-center">
                <p className="text-gray-900 font-medium text-sm mb-1">Aucun résultat trouvé</p>
                <p className="text-gray-500 text-xs">Essayez d'autres mots clés pour "{query}"</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
