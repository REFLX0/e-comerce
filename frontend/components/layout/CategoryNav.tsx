'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Link } from '@/i18n/routing'
import { Bike, Car, ChevronDown, ChevronRight, Package, ShipWheel, Wrench } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/lib/api/categories'
import { useTranslations } from 'next-intl'
import { NAVIGATION_TAXONOMY, type NavigationTaxonomyNode } from '@/lib/navigation/taxonomy'
import type { Category } from '@/lib/types'
import { cn } from '@/lib/utils'

const DROPDOWN_CLOSE_DELAY_MS = 280
const DROPDOWN_OPEN_DELAY_MS = 60

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
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const t = useTranslations('Navigation')
  const tTax = useTranslations('Taxonomy')
  const locale = useLocale()
  const isRtl = locale === 'ar'
  const pathname = usePathname()

  const handleMouseEnter = useCallback((slug: string) => {
    // Clear any pending close timer immediately
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }

    // If another dropdown is already active, switch immediately with zero lag
    if (activeDropdown) {
      if (openTimer.current) {
        clearTimeout(openTimer.current)
        openTimer.current = null
      }
      setActiveDropdown(slug)
      return
    }

    // If opening from a closed state, use a tiny intent debounce (60ms) to avoid accidental rapid flashes
    if (openTimer.current) clearTimeout(openTimer.current)
    openTimer.current = setTimeout(() => {
      setActiveDropdown(slug)
      openTimer.current = null
    }, DROPDOWN_OPEN_DELAY_MS)
  }, [activeDropdown])

  const handleMouseLeave = useCallback(() => {
    // Cancel open timer if cursor left before it opened
    if (openTimer.current) {
      clearTimeout(openTimer.current)
      openTimer.current = null
    }

    // Schedule close with a comfortable 280ms grace period so moving into the dropdown never flickers
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => {
      setActiveDropdown(null)
      closeTimer.current = null
    }, DROPDOWN_CLOSE_DELAY_MS)
  }, [])

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }, [])

  const closeNow = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    if (openTimer.current) clearTimeout(openTimer.current)
    closeTimer.current = null
    openTimer.current = null
    setActiveDropdown(null)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeNow()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      if (closeTimer.current) clearTimeout(closeTimer.current)
      if (openTimer.current) clearTimeout(openTimer.current)
    }
  }, [closeNow])

  return (
    <>
      {/* ── Desktop Nav Bar ── */}
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
              const rootLabel = item.labelKey ? tTax(item.labelKey) : (root?.name ?? item.label ?? item.slug)
              const isOpen = activeDropdown === item.slug

              return (
                <div
                  key={item.slug}
                  className="relative flex items-stretch h-full"
                  onMouseEnter={() => handleMouseEnter(item.slug)}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* ── Nav Button ── */}
                  {item.children.length > 0 ? (
                    <Link
                      href={`/categorie/${item.slug}`}
                      onClick={closeNow}
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
                    </Link>
                  ) : (
                    <Link
                      href={`/categorie/${item.slug}`}
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
                      onMouseEnter={cancelClose}
                      onMouseLeave={handleMouseLeave}
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

      {/* ── Mobile Horizontal Category Pills Strip ── */}
      <nav
        aria-label={t('catalog')}
        className="flex md:hidden border-b border-slate-200/80 bg-white/95 backdrop-blur-md overflow-x-auto hide-scrollbar py-2 px-3 gap-2"
      >
        {NAVIGATION_TAXONOMY.map((item) => {
          const Icon = NAVIGATION_ICONS[item.slug] ?? Package
          const root = findNode(categories, item.slug)
          const rootLabel = item.labelKey ? tTax(item.labelKey) : (root?.name ?? item.label ?? item.slug)
          const isActive = pathname?.includes(`/categorie/${item.slug}`)

          return (
            <Link
              key={item.slug}
              href={`/categorie/${item.slug}`}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95 border',
                isActive
                  ? 'border-[#16254c] bg-[#16254c] text-white shadow-sm'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
              )}
            >
              <Icon size={14} className={isActive ? 'text-[#D4A76A]' : 'text-slate-500'} />
              <span>{rootLabel}</span>
            </Link>
          )
        })}

        <Link
          href="/catalogue"
          className="flex shrink-0 items-center gap-1 rounded-full border border-brand-primary/20 bg-brand-surface px-3 py-1.5 text-xs font-bold text-brand-primary transition-all hover:bg-brand-primary hover:text-white"
        >
          <span>{t('catalog')}</span>
          <ChevronRight size={12} className={isRtl ? 'rotate-180' : ''} />
        </Link>
      </nav>
    </>
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
  const tTax = useTranslations('Taxonomy')

  // Find which child is hovered (to show its sub-panel)
  const activeNode = item.children.find((c) => c.slug === activeChild)
  const hasSubPanel = activeNode && (activeNode.children?.length ?? 0) > 0

  return (
    <div
      role="menu"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="flyout-panel absolute start-0 top-full z-50 flex overflow-hidden before:absolute before:-top-3 before:left-0 before:right-0 before:h-4 before:content-['']"
      style={{
        borderRadius: '0 0 16px 16px',
        border: '1px solid rgba(22,37,76,0.1)',
        boxShadow: '0 20px 60px rgba(22,37,76,0.18)',
        minWidth: 320,
        background: '#fff',
        animation: 'flyoutIn 0.14s ease-out both',
      }}
    >
      {/* LEFT — category list */}
      <div className="flex flex-col" style={{ minWidth: 320, borderRight: hasSubPanel ? '1px solid rgba(22,37,76,0.07)' : 'none' }}>
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
            href={`/categorie/${item.slug}`}
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
            const label = child.labelKey ? tTax(child.labelKey) : (dbNode?.name ?? child.label ?? child.slug)
            const hint = child.hintKey ? tTax(child.hintKey) : child.hint
            const hasSubs = (child.children?.length ?? 0) > 0
            const isActive = activeChild === child.slug

            return (
              <li key={child.slug} role="none">
                {hasSubs ? (
                  // Item with sub-children: hover reveals right panel, clicking navigates to category
                  <Link
                    href={`/categorie/${child.slug}`}
                    role="menuitem"
                    onClick={onClose}
                    onMouseEnter={() => setActiveChild(child.slug)}
                    className="flyout-item group flex w-full items-center justify-between gap-3 px-5 py-2.5 text-sm transition-all duration-150 hover:bg-slate-50"
                    style={{
                      background: isActive ? 'rgba(212,167,106,0.08)' : 'transparent',
                      color: isActive ? '#D4A76A' : '#16254c',
                      fontWeight: isActive ? 700 : 500,
                      borderLeft: isActive ? '3px solid #D4A76A' : '3px solid transparent',
                    }}
                  >
                    <span className="flex items-start gap-2.5 min-w-0">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full transition-colors"
                        style={{ background: isActive ? '#D4A76A' : 'rgba(22,37,76,0.25)' }}
                      />
                      <span className="flex flex-col text-start min-w-0">
                        <span className="font-semibold text-[13px] leading-snug">{label}</span>
                        {hint && (
                          <span className="text-[11px] leading-tight opacity-60 font-normal mt-0.5">
                            {hint}
                          </span>
                        )}
                      </span>
                    </span>
                    <ChevronRight
                      size={13}
                      className={`shrink-0 transition-colors ${isRtl ? 'rotate-180' : ''}`}
                      style={{ color: isActive ? '#D4A76A' : 'rgba(22,37,76,0.3)' }}
                    />
                  </Link>
                ) : (
                  // Leaf item: direct link
                  <Link
                    href={`/categorie/${child.slug}`}
                    role="menuitem"
                    onClick={onClose}
                    onMouseEnter={() => setActiveChild(null)}
                    className="flyout-item group flex items-start gap-2.5 px-5 py-2.5 text-sm transition-all duration-150 hover:bg-slate-50"
                    style={{
                      color: '#16254c',
                      borderLeft: '3px solid transparent',
                    }}
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full transition-colors group-hover:bg-[#D4A76A]"
                      style={{ background: 'rgba(22,37,76,0.25)' }}
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-semibold text-slate-800 text-[13px] leading-snug group-hover:text-[#16254c]">
                        {label}
                      </span>
                      {hint && (
                        <span className="text-[11px] leading-tight text-slate-400 font-normal mt-0.5">
                          {hint}
                        </span>
                      )}
                    </div>
                  </Link>
                )}
              </li>
            )
          })}
        </ul>

        {/* Footer hint */}
        <div className="border-t px-5 py-2.5" style={{ borderColor: 'rgba(22,37,76,0.07)' }}>
          <Link
            href={`/categorie/${item.slug}`}
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-70"
            style={{ color: '#D4A76A' }}
          >
            <span>{tTax('seeAll', { category: rootLabel })}</span>
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
  const tTax = useTranslations('Taxonomy')
  const label = node.labelKey ? tTax(node.labelKey) : (dbNode?.name ?? node.label ?? node.slug)

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
          const subLabel = subChild.labelKey ? tTax(subChild.labelKey) : (subDbNode?.name ?? subChild.label ?? subChild.slug)
          const targetHref = subChild.href || `/categorie/${subChild.slug}`

          return (
            <li key={subChild.slug} role="none">
              <Link
                href={targetHref}
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
          href={`/categorie/${node.slug}`}
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
