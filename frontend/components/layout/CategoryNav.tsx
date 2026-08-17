'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from '@/i18n/routing'
import { Bike, Car, ChevronDown, ChevronRight, Package, ShipWheel, Wrench } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/lib/api/categories'
import { useTranslations } from 'next-intl'
import { NAVIGATION_TAXONOMY, type NavigationTaxonomyNode } from '@/lib/navigation/taxonomy'
import type { Category } from '@/lib/types'

const DROPDOWN_CLOSE_DELAY_MS = 180

const NAVIGATION_ICONS: Record<string, React.ElementType> = {
  automobile: Car,
  'auto-pieces-rechange': Wrench,
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

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const t = useTranslations('Navigation')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  const openDropdown = useCallback((slug: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = null
    setActiveDropdown(slug)
  }, [])

  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setActiveDropdown(null), DROPDOWN_CLOSE_DELAY_MS)
  }, [])

  const closeNow = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = null
    setActiveDropdown(null)
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

  return (
    <nav
      aria-label={t('catalog')}
      className="hidden border-b border-slate-200 bg-white md:block"
      style={{ boxShadow: '0 2px 12px rgba(22,37,76,0.06)' }}
    >
      <div className="section-padding flex h-[52px] items-stretch gap-0">
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
                {/* ── Nav Button ── */}
                {item.children.length > 0 ? (
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-haspopup="menu"
                    className="nav-tab-btn group relative flex h-full items-center gap-2 px-5 text-sm font-semibold transition-all duration-200"
                    style={{
                      color: isOpen ? '#D4A76A' : '#16254c',
                      borderBottom: isOpen ? '2px solid #D4A76A' : '2px solid transparent',
                    }}
                  >
                    <Icon
                      size={15}
                      style={{ color: isOpen ? '#D4A76A' : 'rgba(22,37,76,0.5)' }}
                      className="transition-colors duration-200"
                    />
                    <span>{rootLabel}</span>
                    <ChevronDown
                      size={13}
                      className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      style={{ color: isOpen ? '#D4A76A' : 'rgba(22,37,76,0.4)' }}
                    />
                    {/* hover underline animation */}
                    {!isOpen && (
                      <span className="nav-underline absolute bottom-0 left-0 h-[2px] w-0 bg-brand-accent transition-all duration-200 group-hover:w-full" />
                    )}
                  </button>
                ) : (
                  <Link
                    href={`/catalogue?categorySlug=${item.slug}`}
                    className="group relative flex h-full items-center gap-2 px-5 text-sm font-semibold transition-all duration-200"
                    style={{ color: '#16254c', borderBottom: '2px solid transparent' }}
                  >
                    <Icon size={15} style={{ color: 'rgba(22,37,76,0.5)' }} />
                    <span>{rootLabel}</span>
                    <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-brand-accent transition-all duration-200 group-hover:w-full" />
                  </Link>
                )}

                {/* ── Flyout Panel ── */}
                {isOpen && item.children.length > 0 && (
                  <FlyoutPanel
                    item={item}
                    rootLabel={rootLabel}
                    categories={categories}
                    onClose={closeNow}
                    onMouseEnter={() => openDropdown(item.slug)}
                    onMouseLeave={scheduleClose}
                    isRtl={isRtl}
                    allProductsLabel={t('allProducts')}
                  />
                )}
              </div>
            )
          })}
        </div>

        <div className="ms-auto flex items-center">
          <Link
            href="/catalogue"
            className="inline-flex h-9 items-center gap-2 rounded-lg px-4 text-xs font-bold tracking-wider uppercase transition-all duration-200 hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, #16254c 0%, #1f356b 100%)',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(22,37,76,0.25)',
            }}
          >
            {t('fullCatalog')}
            <ChevronRight size={14} className={isRtl ? 'rotate-180' : ''} />
          </Link>
        </div>
      </div>
    </nav>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   FlyoutPanel — the dropdown that opens below a nav tab.
   It uses a LEFT sidebar (list of direct children) + RIGHT sub-panel that
   appears when a child with sub-children is hovered.
───────────────────────────────────────────────────────────────────────────── */
function FlyoutPanel({
  item,
  rootLabel,
  categories,
  onClose,
  onMouseEnter,
  onMouseLeave,
  isRtl,
  allProductsLabel,
}: {
  item: (typeof NAVIGATION_TAXONOMY)[number]
  rootLabel: string
  categories: Category[] | undefined
  onClose: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  isRtl: boolean
  allProductsLabel: string
}) {
  const [activeChild, setActiveChild] = useState<string | null>(null)

  // Find which child is hovered (to show its sub-panel)
  const activeNode = item.children.find((c) => c.slug === activeChild)
  const hasSubPanel = activeNode && (activeNode.children?.length ?? 0) > 0

  return (
    <div
      role="menu"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="flyout-panel absolute start-0 top-full z-50 flex overflow-hidden"
      style={{
        borderRadius: '0 0 16px 16px',
        border: '1px solid rgba(22,37,76,0.1)',
        boxShadow: '0 20px 60px rgba(22,37,76,0.18)',
        minWidth: 260,
        background: '#fff',
        animation: 'flyoutIn 0.18s cubic-bezier(0.16,1,0.3,1) both',
      }}
    >
      {/* LEFT — category list */}
      <div className="flex flex-col" style={{ minWidth: 260, borderRight: hasSubPanel ? '1px solid rgba(22,37,76,0.07)' : 'none' }}>
        {/* Panel header */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{
            background: 'linear-gradient(135deg, #16254c 0%, #1f356b 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <span className="text-xs font-bold tracking-[0.16em] uppercase" style={{ color: '#D4A76A' }}>
            {rootLabel}
          </span>
          <Link
            href={`/catalogue?categorySlug=${item.slug}`}
            onClick={onClose}
            className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            {allProductsLabel}
            <ChevronRight size={12} className={isRtl ? 'rotate-180' : ''} />
          </Link>
        </div>

        {/* Items */}
        <ul className="flex flex-col py-2">
          {item.children.map((child) => {
            const dbNode = findNode(categories, child.slug)
            const label = dbNode?.name ?? child.label ?? child.slug
            const hasSubs = (child.children?.length ?? 0) > 0
            const isActive = activeChild === child.slug

            return (
              <li key={child.slug} role="none">
                {hasSubs ? (
                  // Item with sub-children: hover reveals right panel
                  <button
                    type="button"
                    role="menuitem"
                    onMouseEnter={() => setActiveChild(child.slug)}
                    className="flyout-item group flex w-full items-center justify-between gap-3 px-5 py-[10px] text-sm transition-all duration-150"
                    style={{
                      background: isActive ? 'rgba(212,167,106,0.08)' : 'transparent',
                      color: isActive ? '#D4A76A' : '#16254c',
                      fontWeight: isActive ? 700 : 500,
                      borderLeft: isActive ? '3px solid #D4A76A' : '3px solid transparent',
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full transition-colors"
                        style={{ background: isActive ? '#D4A76A' : 'rgba(22,37,76,0.25)' }}
                      />
                      {label}
                    </span>
                    <ChevronRight
                      size={13}
                      className={`transition-colors ${isRtl ? 'rotate-180' : ''}`}
                      style={{ color: isActive ? '#D4A76A' : 'rgba(22,37,76,0.3)' }}
                    />
                  </button>
                ) : (
                  // Leaf item: direct link
                  <Link
                    href={`/catalogue?categorySlug=${child.slug}`}
                    role="menuitem"
                    onClick={onClose}
                    onMouseEnter={() => setActiveChild(null)}
                    className="flyout-item group flex items-center gap-2 px-5 py-[10px] text-sm font-medium transition-all duration-150"
                    style={{
                      color: '#16254c',
                      borderLeft: '3px solid transparent',
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full transition-colors group-hover:bg-brand-accent"
                      style={{ background: 'rgba(22,37,76,0.25)' }}
                    />
                    <span>{label}</span>
                    {child.hint && (
                      <span className="ms-auto text-[11px]" style={{ color: 'rgba(22,37,76,0.4)' }}>
                        {child.hint}
                      </span>
                    )}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>

        {/* Footer hint */}
        <div className="border-t px-5 py-2.5" style={{ borderColor: 'rgba(22,37,76,0.07)' }}>
          <Link
            href={`/catalogue?categorySlug=${item.slug}`}
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-70"
            style={{ color: '#D4A76A' }}
          >
            <span>Voir tout {rootLabel}</span>
            <ChevronRight size={12} className={isRtl ? 'rotate-180' : ''} />
          </Link>
        </div>
      </div>

      {/* RIGHT — sub-panel (only when hovering a node with children) */}
      {hasSubPanel && activeNode && (
        <SubPanel
          node={activeNode}
          dbNode={findNode(categories, activeNode.slug)}
          categories={categories}
          onClose={onClose}
          isRtl={isRtl}
          allProductsLabel={allProductsLabel}
        />
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   SubPanel — the right-hand column that shows sub-children of a hovered node.
───────────────────────────────────────────────────────────────────────────── */
function SubPanel({
  node,
  dbNode,
  categories,
  onClose,
  isRtl,
  allProductsLabel,
}: {
  node: NavigationTaxonomyNode
  dbNode: Category | undefined
  categories: Category[] | undefined
  onClose: () => void
  isRtl: boolean
  allProductsLabel: string
}) {
  const label = dbNode?.name ?? node.label ?? node.slug

  return (
    <div
      className="flex flex-col"
      style={{
        minWidth: 220,
        background: 'linear-gradient(180deg, #fafbff 0%, #fff 100%)',
        animation: 'subPanelIn 0.15s ease both',
      }}
    >
      {/* Sub-panel header */}
      <div
        className="px-5 py-3"
        style={{
          background: 'rgba(212,167,106,0.08)',
          borderBottom: '1px solid rgba(212,167,106,0.2)',
        }}
      >
        <span className="text-xs font-bold tracking-[0.14em] uppercase" style={{ color: '#16254c' }}>
          {label}
        </span>
      </div>

      {/* Sub-items */}
      <ul className="flex flex-col py-2">
        {(node.children ?? []).map((subChild) => {
          const subDbNode = dbNode?.children?.find((c) => c.slug === subChild.slug)
          const subLabel = subDbNode?.name ?? subChild.label ?? subChild.slug

          return (
            <li key={subChild.slug} role="none">
              <Link
                href={`/catalogue?categorySlug=${subChild.slug}`}
                role="menuitem"
                onClick={onClose}
                className="sub-item group flex items-center gap-3 px-5 py-[10px] text-sm font-medium transition-all duration-150"
                style={{ color: '#16254c' }}
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-150 group-hover:scale-110"
                  style={{ background: 'rgba(212,167,106,0.15)' }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: '#D4A76A' }}
                  />
                </span>
                <span className="transition-colors group-hover:text-brand-accent">{subLabel}</span>
                <ChevronRight
                  size={12}
                  className={`ms-auto opacity-0 transition-all duration-150 group-hover:opacity-100 ${isRtl ? 'rotate-180' : ''}`}
                  style={{ color: '#D4A76A' }}
                />
              </Link>
            </li>
          )
        })}
      </ul>

      {/* Link to parent category */}
      <div className="mt-auto border-t px-5 py-2.5" style={{ borderColor: 'rgba(22,37,76,0.07)' }}>
        <Link
          href={`/catalogue?categorySlug=${node.slug}`}
          onClick={onClose}
          className="flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-70"
          style={{ color: 'rgba(22,37,76,0.5)' }}
        >
          {allProductsLabel}
          <ChevronRight size={11} className={isRtl ? 'rotate-180' : ''} />
        </Link>
      </div>
    </div>
  )
}
