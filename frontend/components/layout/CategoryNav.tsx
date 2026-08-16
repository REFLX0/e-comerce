'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from '@/i18n/routing'
import { Bike, Car, ChevronDown, ChevronRight, Package, ShipWheel } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/lib/api/categories'
import { useTranslations } from 'next-intl'
import { NAVIGATION_TAXONOMY, type NavigationTaxonomyNode } from '@/lib/navigation/taxonomy'
import type { Category } from '@/lib/types'

/**
 * Mouse-leave debounce (ms): keeps the panel open while the cursor crosses
 * the gap between the nav button and the dropdown, and prevents flicker
 * when moving between sibling items.
 */
const DROPDOWN_CLOSE_DELAY_MS = 160

const NAVIGATION_ICONS: Record<string, React.ElementType> = {
  automobile: Car,
  'moto-karting': Bike,
  marine: ShipWheel,
}

function findNode(categories: Category[] | undefined, slug: string): Category | undefined {
  return categories?.find((category) => category.slug === slug)
}

export function CategoryNav() {
  const { data: categories } = useQuery({
    queryKey: ['categories-tree'],
    queryFn: categoriesApi.getTree,
    staleTime: 5 * 60 * 1000,
  })

  // Single state, keyed by the hovered item's slug → only ONE dropdown can
  // ever be open; hovering a new item closes the previous one by construction.
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const t = useTranslations('Navigation')
  const locale = useLocale()
  // ChevronRight points right in LTR; flip it in RTL so the visual arrow
  // still indicates "forward / into the submenu".
  const chevronRtlClass = locale === 'ar' ? 'rtl-flip' : ''

  const openDropdown = useCallback((slug: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = null
    setActiveDropdown(slug)
  }, [])

  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setActiveDropdown(null), DROPDOWN_CLOSE_DELAY_MS)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveDropdown(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  }, [])

  const closeNow = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = null
    setActiveDropdown(null)
  }, [])

  return (
    <nav
      aria-label={t('catalog')}
      className="hidden border-b border-slate-200 bg-white shadow-[0_5px_15px_rgba(22,37,76,0.03)] md:block"
    >
      <div className="section-padding flex h-14 items-stretch gap-1">
        <div className="flex min-w-0 items-stretch">
          {NAVIGATION_TAXONOMY.map((item) => {
            const Icon = NAVIGATION_ICONS[item.slug] ?? Package
            const root = findNode(categories, item.slug)
            const rootLabel = root?.name ?? item.label ?? item.slug
            const isOpen = activeDropdown === item.slug

            return (
              <div
                key={item.slug}
                className="relative"
                onMouseEnter={() => openDropdown(item.slug)}
                onMouseLeave={scheduleClose}
              >
                {item.children.length > 0 ? (
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-haspopup="menu"
                    className={`flex h-full items-center gap-2 border-b-2 px-4 text-sm font-bold transition-colors ${isOpen ? 'border-brand-accent text-brand-primary' : 'text-brand-primary/80 hover:text-brand-primary border-transparent'}`}
                  >
                    <Icon
                      size={16}
                      className={isOpen ? 'text-brand-accent' : 'text-brand-primary/60'}
                    />
                    {rootLabel}
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                ) : (
                  <Link
                    href={`/catalogue?categorySlug=${item.slug}`}
                    className="text-brand-primary/80 hover:border-brand-accent hover:text-brand-primary flex h-full items-center gap-2 border-b-2 border-transparent px-4 text-sm font-bold transition-colors"
                  >
                    <Icon size={16} className="text-brand-primary/60" />
                    {rootLabel}
                  </Link>
                )}

                {isOpen && (
                  <div
                    role="menu"
                    className="absolute start-0 top-full z-50 w-[min(920px,calc(100vw-2rem))] overflow-hidden rounded-b-2xl border border-slate-200 bg-white shadow-[0_18px_40px_rgba(22,37,76,0.16)]"
                    onMouseEnter={() => openDropdown(item.slug)}
                    onMouseLeave={scheduleClose}
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
                      <p className="text-brand-accent text-[11px] font-bold tracking-[0.18em] uppercase">
                        {rootLabel}
                      </p>
                      <Link
                        href={`/catalogue?categorySlug=${item.slug}`}
                        onClick={closeNow}
                        className="text-brand-primary inline-flex items-center gap-1 text-sm font-bold hover:underline"
                      >
                        {t('allProducts')} <ChevronRight size={14} className={chevronRtlClass} />
                      </Link>
                    </div>

                    {/* Only THIS item's own tree — structure comes from the
                        typed taxonomy const, never from a flattened list. */}
                    <div className="grid grid-cols-3 gap-x-7 gap-y-6 p-6">
                      {item.children.map((child) => (
                        <MegaMenuColumn
                          key={child.slug}
                          node={child}
                          dbNode={findNode(categories, child.slug)}
                          onNavigate={closeNow}
                          allProductsLabel={t('allProducts')}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="ms-auto flex items-center">
          <Link
            href="/catalogue"
            className="bg-brand-primary hover:bg-brand-primary-light inline-flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-bold tracking-wider text-white uppercase transition-colors"
          >
            {t('fullCatalog')} <ChevronRight size={14} className={chevronRtlClass} />
          </Link>
        </div>
      </div>
    </nav>
  )
}

function MegaMenuColumn({
  node,
  dbNode,
  onNavigate,
  allProductsLabel,
}: {
  node: NavigationTaxonomyNode
  dbNode: Category | undefined
  onNavigate: () => void
  allProductsLabel: string
}) {
  const label = dbNode?.name ?? node.label ?? node.slug
  const hasChildren = Boolean(node.children?.length)
  const chevronRtlClass = useLocale() === 'ar' ? 'rtl-flip' : ''

  return (
    <div className="min-w-0">
      <Link
        href={`/catalogue?categorySlug=${node.slug}`}
        onClick={onNavigate}
        className="border-brand-primary/10 text-brand-primary hover:text-brand-accent block border-b pb-2 text-sm font-bold transition-colors"
      >
        {label}
      </Link>
      {node.hint && <p className="mt-1 text-[11px] leading-snug text-slate-400">{node.hint}</p>}
      {hasChildren ? (
        <ul className="mt-3 flex flex-col gap-2.5">
          {(node.children ?? []).map((subChild) => {
            const subDbNode = dbNode?.children?.find((c) => c.slug === subChild.slug)
            const subLabel = subDbNode?.name ?? subChild.label ?? subChild.slug
            return (
              <li key={subChild.slug}>
                <Link
                  href={`/catalogue?categorySlug=${subChild.slug}`}
                  onClick={onNavigate}
                  className="group text-brand-primary/70 hover:text-brand-primary flex items-center gap-2 text-sm font-medium transition-colors"
                >
                  <span className="bg-brand-primary/20 group-hover:bg-brand-accent h-1.5 w-1.5 shrink-0 rounded-full transition-colors" />
                  <span className="truncate">{subLabel}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      ) : (
        <Link
          href={`/catalogue?categorySlug=${node.slug}`}
          onClick={onNavigate}
          className="group bg-brand-primary/5 text-brand-primary hover:bg-brand-primary mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors hover:text-white"
        >
          {allProductsLabel} <ChevronRight size={12} className={chevronRtlClass} />
        </Link>
      )}
    </div>
  )
}
