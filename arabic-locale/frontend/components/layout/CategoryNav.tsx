"use client";

import { useCallback, useRef, useState } from 'react'
import { Link } from '@/i18n/routing'
import { Bike, Car, ChevronDown, ChevronRight, Droplets, Package, ShipWheel, Wrench } from 'lucide-react'
import { useLocale } from 'next-intl'
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

function uniqueByName<T extends { name: string }>(items: T[]) {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = item.name.trim().toLocaleLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function CategoryNav() {
  const { data: categories } = useQuery({
    queryKey: ['categories-tree'],
    queryFn: categoriesApi.getTree,
  })
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const t = useTranslations('Navigation')
  const locale = useLocale()
  // ChevronRight points right in LTR; flip it in RTL so the visual arrow
  // still indicates "forward / into the submenu".
  const chevronRtlClass = locale === 'ar' ? 'rtl-flip' : ''

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
                  <div className="absolute start-0 top-full z-50 w-[min(920px,calc(100vw-2rem))] overflow-hidden rounded-b-2xl border border-slate-200 bg-white shadow-[0_18px_40px_rgba(22,37,76,0.16)]" onMouseEnter={() => openDropdown(category.slug)} onMouseLeave={scheduleClose}>
                    <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 flex items-center justify-between">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-accent">{category.name}</p>
                      <Link href={`/catalogue?categorySlug=${category.slug}`} onClick={() => setActiveDropdown(null)} className="inline-flex items-center gap-1 text-sm font-bold text-brand-primary hover:underline">
                        {t('allProducts')} <ChevronRight size={14} className={chevronRtlClass} />
                      </Link>
                    </div>
                    <div className="grid grid-cols-3 gap-x-7 gap-y-6 p-6">
                      {uniqueByName(category.children ?? []).map((child) => (
                        <div key={child.id} className="min-w-0">
                          <Link href={`/catalogue?categorySlug=${child.slug}`} onClick={() => setActiveDropdown(null)} className="block mb-4 text-sm font-bold text-brand-primary hover:text-brand-accent transition-colors border-b border-brand-primary/10 pb-2">
                            {child.name}
                          </Link>
                          {child.children && child.children.length > 0 ? (
                            <ul className="flex flex-col gap-2.5">
                              {uniqueByName(child.children).map((subChild) => (
                                <li key={subChild.id}>
                                  <Link href={`/catalogue?categorySlug=${subChild.slug}`} onClick={() => setActiveDropdown(null)} className="group flex items-center gap-2 text-sm font-medium text-brand-primary/70 hover:text-brand-primary transition-colors">
                                    <span className="h-1.5 w-1.5 rounded-full bg-brand-primary/20 group-hover:bg-brand-accent transition-colors" />
                                    <span className="truncate">{subChild.name}</span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <Link href={`/catalogue?categorySlug=${child.slug}`} onClick={() => setActiveDropdown(null)} className="group inline-flex items-center gap-2 rounded-lg bg-brand-primary/5 px-3 py-2 text-xs font-semibold text-brand-primary transition-colors hover:bg-brand-primary hover:text-white">
                              {t('allProducts')} <ChevronRight size={12} className={chevronRtlClass} />
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="ms-auto flex items-center">
          <Link href="/catalogue" className="inline-flex h-9 items-center gap-2 rounded-xl bg-brand-primary px-4 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-brand-primary-light">
            {t('fullCatalog')} <ChevronRight size={14} className={chevronRtlClass} />
          </Link>
        </div>
      </div>
    </nav>
  )
}
