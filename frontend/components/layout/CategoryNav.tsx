"use client";

import { useCallback, useRef, useState } from 'react'
import { Link } from '@/i18n/routing'
import { Bike, Car, ChevronDown, ChevronRight, Droplets, Package, ShipWheel, Wrench } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/lib/api/categories'
import { useTranslations } from 'next-intl'

const NAVIGATION_ORDER = ['pieces-auto', 'automobile', 'additifs', 'moto-karting', 'marine']

const NAVIGATION_ICONS: Record<string, React.ElementType> = {
  'pieces-auto': Wrench,
  additifs: Droplets,
  automobile: Car,
  'moto-karting': Bike,
  marine: ShipWheel,
}

export function CategoryNav() {
  const { data: categories } = useQuery({
    queryKey: ['categories-tree'],
    queryFn: categoriesApi.getTree,
  })
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const t = useTranslations('Navigation')

  const openDropdown = useCallback((slug: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setActiveDropdown(slug)
  }, [])

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setActiveDropdown(null), 140)
  }, [])

  if (!categories) return null

  const navigationCategories = NAVIGATION_ORDER
    .map((slug) => categories.find((category) => category.slug === slug))
    .filter((category): category is NonNullable<typeof category> => Boolean(category))

  return (
    <nav aria-label={t('catalog')} className="hidden border-b border-slate-200 bg-white shadow-[0_5px_15px_rgba(22,37,76,0.03)] md:block">
      <div className="section-padding flex h-14 items-stretch gap-1">
        <div className="flex min-w-0 items-stretch">
          {navigationCategories.map((category) => {
            const Icon = NAVIGATION_ICONS[category.slug] ?? Package
            const hasChildren = Boolean(category.children?.length)
            const isOpen = activeDropdown === category.slug

            return (
              <div key={category.id} className="relative" onMouseEnter={() => openDropdown(category.slug)} onMouseLeave={scheduleClose}>
                {hasChildren ? (
                  <button
                    aria-expanded={isOpen}
                    className={`flex h-full items-center gap-2 border-b-2 px-4 text-sm font-bold transition-colors ${isOpen ? 'border-brand-accent text-brand-primary' : 'border-transparent text-brand-primary/80 hover:text-brand-primary'}`}
                  >
                    <Icon size={16} className={isOpen ? 'text-brand-accent' : 'text-brand-primary/60'} />
                    {category.name}
                    <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <Link href={`/catalogue?categorySlug=${category.slug}`} className="flex h-full items-center gap-2 border-b-2 border-transparent px-4 text-sm font-bold text-brand-primary/80 transition-colors hover:border-brand-accent hover:text-brand-primary">
                    <Icon size={16} className="text-brand-primary/60" />
                    {category.name}
                  </Link>
                )}

                {hasChildren && isOpen && (
                  <div className="absolute left-0 top-full z-50 w-80 overflow-hidden rounded-b-2xl border border-slate-200 bg-white shadow-[0_18px_40px_rgba(22,37,76,0.16)]" onMouseEnter={() => openDropdown(category.slug)} onMouseLeave={scheduleClose}>
                    <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-accent">{category.name}</p>
                      <Link href={`/catalogue?categorySlug=${category.slug}`} onClick={() => setActiveDropdown(null)} className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-brand-primary hover:underline">
                        {t('allProducts')} <ChevronRight size={14} />
                      </Link>
                    </div>
                    <div className="p-2">
                      {category.children?.map((child) => (
                        <Link key={child.id} href={`/catalogue?categorySlug=${child.slug}`} onClick={() => setActiveDropdown(null)} className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-brand-primary/75 transition-colors hover:bg-brand-primary hover:text-white">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/5 text-brand-primary transition-colors group-hover:bg-white/15 group-hover:text-brand-accent"><ChevronRight size={15} /></span>
                          <span>{child.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="ml-auto flex items-center">
          <Link href="/catalogue" className="inline-flex h-9 items-center gap-2 rounded-xl bg-brand-primary px-4 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-brand-primary-light">
            {t('fullCatalog')} <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </nav>
  )
}
