"use client";

import { useState, useRef, useCallback } from 'react'
import { Link } from '@/i18n/routing'
import { ChevronDown, ChevronRight, Sparkles } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/lib/api/categories'
import { productsApi } from '@/lib/api/products'
import Image from 'next/image'

export function CategoryNav() {
  const { data: categories } = useQuery({
    queryKey: ['categories-tree'],
    queryFn: categoriesApi.getTree,
  })

  const { data: bestSellers } = useQuery({
    queryKey: ['nav-best-sellers'],
    queryFn: () => productsApi.getBestSellers(3),
    staleTime: 1000 * 60 * 5,
  })

  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleEnter = useCallback((index: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveIndex(index)
  }, [])

  const handleLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setActiveIndex(null), 200)
  }, [])

  if (!categories || categories.length === 0) return null

  return (
    <nav className="hidden bg-[#E10600] md:block">
      <div className="section-padding flex min-h-[48px] items-stretch">
        {categories.map((category, index) => {
          const hasChildren = category.children && category.children.length > 0
          const isActive = activeIndex === index

          return (
            <div
              key={category.id}
              className="relative"
              onMouseEnter={() => handleEnter(index)}
              onMouseLeave={handleLeave}
            >
              {hasChildren ? (
                <button
                  className={`flex h-full items-center gap-1.5 px-4 text-[13px] font-semibold uppercase tracking-wider text-white/90 transition-colors hover:bg-black/15 hover:text-white ${
                    isActive ? 'bg-black/15 text-white' : ''
                  }`}
                >
                  {category.name}
                  <ChevronDown
                    size={12}
                    className={`transition-transform duration-150 ${isActive ? 'rotate-180' : ''}`}
                  />
                </button>
              ) : (
                <Link
                  href={`/categorie/${category.slug}`}
                  className="flex h-full items-center px-4 text-[13px] font-semibold uppercase tracking-wider text-white/90 transition-colors hover:bg-black/15 hover:text-white"
                >
                  {category.name}
                </Link>
              )}

              {hasChildren && isActive && (
                <div
                  className="absolute left-0 top-full z-50 w-[480px] origin-top-right animate-in fade-in slide-in-from-top-1 duration-150 rounded-b-lg border border-gray-100 bg-white shadow-2xl"
                  onMouseEnter={() => handleEnter(index)}
                  onMouseLeave={handleLeave}
                >
                  <div className="flex">
                    <div className="min-w-0 flex-1 p-5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        {category.name}
                      </span>
                      <div className="mt-3 flex flex-col gap-0.5">
                        <Link
                          href={`/categorie/${category.slug}`}
                          onClick={() => setActiveIndex(null)}
                          className="group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-brand-primary transition-colors hover:bg-brand-surface"
                        >
                          <ChevronRight size={14} className="text-brand-accent" />
                          Tous les produits
                        </Link>
                        {category.children?.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/categorie/${sub.slug}`}
                            onClick={() => setActiveIndex(null)}
                            className="group flex items-center gap-2 rounded-md px-3 py-2 text-sm text-brand-primary/76 transition-colors hover:bg-brand-surface hover:text-brand-primary"
                          >
                            <ChevronRight size={14} className="text-brand-accent/60" />
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {bestSellers && bestSellers.length > 0 && (
                      <div className="hidden w-48 shrink-0 border-l border-gray-100 p-5 sm:block">
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          <Sparkles size={11} className="text-amber-500" />
                          Meilleures ventes
                        </span>
                        <div className="mt-3 flex flex-col gap-3">
                          {bestSellers.slice(0, 2).map((product) => (
                            <Link
                              key={product.id}
                              href={`/produit/${product.slug}`}
                              onClick={() => setActiveIndex(null)}
                              className="group flex items-start gap-2.5 rounded-md p-1.5 transition-colors hover:bg-brand-surface"
                            >
                              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-brand-surface">
                                {product.images?.[0] ? (
                                  <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                                ) : (
                                  <div className="h-full w-full bg-gray-200" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <span className="block truncate text-xs font-semibold text-brand-primary group-hover:text-brand-accent transition-colors">
                                  {product.name}
                                </span>
                                <span className="text-[11px] font-medium text-gray-500">
                                  {product.variants?.[0]?.priceTTC?.toFixed(2)} TND
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        <Link
          href="/catalogue"
          onClick={() => setActiveIndex(null)}
          className="ml-auto flex items-center px-4 text-[12px] font-bold uppercase tracking-wider text-white/70 transition-colors hover:bg-black/15 hover:text-white"
        >
          Tout le catalogue →
        </Link>
      </div>
    </nav>
  )
}
