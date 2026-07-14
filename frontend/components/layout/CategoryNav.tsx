"use client";

import { useState, useRef, useCallback } from 'react'
import { Link } from '@/i18n/routing'
import {
  ChevronDown,
  ChevronRight,
  Sparkles,
  Gauge,
  Car,
  Droplets,
  Shell,
  Filter,
  Cable,
  Thermometer,
  Disc3,
  Tractor,
  FlaskConical,
  Bike,
  Package,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/lib/api/categories'
import { productsApi } from '@/lib/api/products'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

const TOP_SLUGS = new Set([
  'huiles-moteur',
  'automobile',
  'hydraulique',
  'graisses',
  'filtres',
])

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'huiles-moteur': <Gauge size={16} />,
  'automobile': <Car size={16} />,
  'hydraulique': <Droplets size={16} />,
  'graisses': <Shell size={16} />,
  'filtres': <Filter size={16} />,
  'transmission': <Cable size={16} />,
  'refroidissement': <Thermometer size={16} />,
  'frein': <Disc3 size={16} />,
  'poids-lourd-agricole': <Tractor size={16} />,
  'additifs': <FlaskConical size={16} />,
  'moto': <Bike size={16} />,
}

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

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [moreOpen, setMoreOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const t = useTranslations('Navigation')

  const handleEnter = useCallback((slug: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveDropdown(slug)
  }, [])

  const handleLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setActiveDropdown(null), 200)
  }, [])

  const handleMoreEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setMoreOpen(true)
  }, [])

  const handleMoreLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setMoreOpen(false), 200)
  }, [])

  if (!categories || categories.length === 0) return null

  const topCats = categories.filter((c) => TOP_SLUGS.has(c.slug))
  const moreCats = categories.filter((c) => !TOP_SLUGS.has(c.slug))

  return (
    <nav className="hidden border-b border-gray-100 bg-white md:block">
      <div className="section-padding flex h-12 items-center justify-center gap-1">
        {topCats.map((category) => {
          const hasChildren = category.children && category.children.length > 0
          const isActive = activeDropdown === category.slug

          return (
            <div
              key={category.id}
              className="relative"
              onMouseEnter={() => handleEnter(category.slug)}
              onMouseLeave={handleLeave}
            >
              {hasChildren ? (
                <button
                  className={`flex h-12 items-center gap-1.5 whitespace-nowrap px-3 text-sm font-semibold tracking-wide text-brand-primary transition-colors duration-150 hover:text-brand-accent ${
                    isActive ? 'text-brand-accent' : ''
                  }`}
                >
                  {category.name}
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-150 ${isActive ? 'rotate-180' : ''}`}
                  />
                </button>
              ) : (
                <Link
                  href={`/catalogue?categorySlug=${category.slug}`}
                  className={`flex h-12 items-center whitespace-nowrap px-3 text-sm font-semibold tracking-wide text-brand-primary transition-colors duration-150 hover:text-brand-accent ${
                    isActive ? 'text-brand-accent' : ''
                  }`}
                >
                  {category.name}
                </Link>
              )}

              {hasChildren && isActive && (
                <div
                  className="absolute left-0 top-full z-50 w-[480px] origin-top-right animate-in fade-in slide-in-from-top-1.5 duration-150 rounded-b-xl border border-gray-100 bg-white shadow-xl"
                  onMouseEnter={() => handleEnter(category.slug)}
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
                          onClick={() => { setActiveDropdown(null); setMoreOpen(false) }}
                          className="group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-brand-primary transition-colors hover:bg-brand-surface"
                        >
                          <ChevronRight size={14} className="text-brand-accent" />
                          {t('allProducts')}
                        </Link>
                        {category.children?.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/categorie/${sub.slug}`}
                            onClick={() => { setActiveDropdown(null); setMoreOpen(false) }}
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
                          {t('bestSellers')}
                        </span>
                        <div className="mt-3 flex flex-col gap-3">
                          {bestSellers.slice(0, 2).map((product) => (
                            <Link
                              key={product.id}
                              href={`/produit/${product.slug}`}
                              onClick={() => { setActiveDropdown(null); setMoreOpen(false) }}
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

        {/* More dropdown */}
        <div
          className="relative"
          onMouseEnter={handleMoreEnter}
          onMouseLeave={handleMoreLeave}
        >
          <button
            aria-expanded={moreOpen}
            className={`flex h-12 items-center gap-1.5 whitespace-nowrap px-3 text-sm font-semibold tracking-wide transition-colors duration-150 ${
              moreOpen
                ? 'text-brand-accent'
                : 'text-brand-primary/60 hover:text-brand-primary'
            }`}
          >
            <Package size={15} />
            Plus
            <ChevronDown
              size={13}
              className={`transition-transform duration-150 ${moreOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {moreOpen && (
            <div
              className="absolute right-0 top-full z-50 w-72 origin-top-right animate-in fade-in slide-in-from-top-1.5 duration-150 rounded-xl border border-gray-100 bg-white shadow-lg"
              onMouseEnter={handleMoreEnter}
              onMouseLeave={handleMoreLeave}
            >
              <div className="p-2">
                {moreCats.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/catalogue?categorySlug=${cat.slug}`}
                    onClick={() => { setActiveDropdown(null); setMoreOpen(false) }}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-brand-primary transition-colors duration-100 hover:bg-[#F5F6F8]"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-surface text-brand-accent">
                      {CATEGORY_ICONS[cat.slug] || <Package size={15} />}
                    </span>
                    <span className="flex-1">{cat.name}</span>
                    <ChevronRight size={14} className="text-gray-300" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center">
          <Link
            href="/catalogue"
            onClick={() => { setActiveDropdown(null); setMoreOpen(false) }}
            className="flex h-9 items-center whitespace-nowrap rounded-lg bg-brand-primary px-5 text-xs font-bold uppercase tracking-wider text-white transition-all duration-150 hover:bg-brand-primary-light"
          >
            {t('fullCatalog')}
          </Link>
        </div>
      </div>
    </nav>
  )
}
