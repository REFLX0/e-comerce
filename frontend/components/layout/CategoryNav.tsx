'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Link } from '@/i18n/routing'
import { Bike, Car, ChevronDown, ChevronRight, Package, ShipWheel, Wrench, X } from 'lucide-react'
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

function isItemActive(item: (typeof NAVIGATION_TAXONOMY)[number], pathname: string | null): boolean {
  if (!pathname) return false
  if (pathname.includes(`/categorie/${item.slug}`)) return true
  return item.children.some((c) => {
    if (pathname.includes(`/categorie/${c.slug}`)) return true
    return (c.children ?? []).some((sc) => pathname.includes(`/categorie/${sc.slug}`))
  })
}

export function CategoryNav() {
  const { data: categories } = useQuery({
    queryKey: ['categories-tree'],
    queryFn: categoriesApi.getTree,
    staleTime: 5 * 60 * 1000,
  })

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileActiveCategory, setMobileActiveCategory] = useState<string | null>(null)
  const navRef = useRef<HTMLElement | null>(null)
  const mobileNavRef = useRef<HTMLDivElement | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const t = useTranslations('Navigation')
  const tTax = useTranslations('Taxonomy')
  const locale = useLocale()
  const isRtl = locale === 'ar'
  const pathname = usePathname()

  // Close mobile category menu when route changes
  useEffect(() => {
    setMobileActiveCategory(null)
    setActiveDropdown(null)
  }, [pathname])

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
      if (event.key === 'Escape') {
        closeNow()
        setMobileActiveCategory(null)
      }
    }
    const onOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        closeNow()
      }
      if (mobileNavRef.current && !mobileNavRef.current.contains(event.target as Node)) {
        setMobileActiveCategory(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onOutsideClick)
    document.addEventListener('touchstart', onOutsideClick)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onOutsideClick)
      document.removeEventListener('touchstart', onOutsideClick)
      if (closeTimer.current) clearTimeout(closeTimer.current)
      if (openTimer.current) clearTimeout(openTimer.current)
    }
  }, [closeNow])

  const activeMobileItem = NAVIGATION_TAXONOMY.find((item) => item.slug === mobileActiveCategory)
  const activeMobileNode = activeMobileItem ? findNode(categories, activeMobileItem.slug) : undefined
  const activeMobileRootLabel = activeMobileItem
    ? activeMobileItem.labelKey
      ? tTax(activeMobileItem.labelKey)
      : (activeMobileNode?.name ?? activeMobileItem.label ?? activeMobileItem.slug)
    : ''
  const ActiveMobileIcon = activeMobileItem ? (NAVIGATION_ICONS[activeMobileItem.slug] ?? Package) : Package

  return (
    <>
      {/* ── Desktop & Tablet Nav Bar (>= md) ── */}
      <nav
        ref={navRef}
        aria-label={t('catalog')}
        className="hidden border-b border-slate-200 bg-white md:block"
        style={{ boxShadow: '0 2px 12px rgba(22,37,76,0.06)' }}
      >
        <div className="section-padding flex h-[52px] items-center justify-between gap-1 sm:gap-2">
          {/* Scrollable tabs container for tablets and tight screens */}
          <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-1.5 md:gap-2 overflow-x-auto hide-scrollbar py-1">
            {NAVIGATION_TAXONOMY.map((item, index) => {
              const Icon = NAVIGATION_ICONS[item.slug] ?? Package
              const root = findNode(categories, item.slug)
              const rootLabel = item.labelKey ? tTax(item.labelKey) : (root?.name ?? item.label ?? item.slug)
              const isOpen = activeDropdown === item.slug
              const isActive = isItemActive(item, pathname)
              // Right-align flyout for categories on the right half to prevent off-screen overflow
              const alignEnd = index >= Math.max(1, NAVIGATION_TAXONOMY.length - 2)

              return (
                <div
                  key={item.slug}
                  className="relative flex shrink-0 items-center h-full"
                  onMouseEnter={() => handleMouseEnter(item.slug)}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* ── Nav Button ── */}
                  {item.children.length > 0 ? (
                    <Link
                      href={`/categorie/${item.slug}`}
                      onClick={(e) => {
                        // On touch/tablet: first tap opens the dropdown to browse subcategories
                        if (!isOpen) {
                          e.preventDefault()
                          if (closeTimer.current) clearTimeout(closeTimer.current)
                          setActiveDropdown(item.slug)
                        } else {
                          closeNow()
                        }
                      }}
                      aria-expanded={isOpen}
                      aria-haspopup="menu"
                      className={cn(
                        'nav-tab-btn group relative flex items-center gap-1.5 sm:gap-2 rounded-full px-3 py-1.5 md:px-3 lg:px-4 text-xs md:text-xs lg:text-sm font-semibold transition-all duration-200 border whitespace-nowrap shrink-0',
                        isActive
                          ? 'border-[#16254c] bg-[#16254c] text-white shadow-sm'
                          : isOpen
                          ? 'border-[#D4A76A]/40 bg-[#D4A76A]/10 text-[#16254c]'
                          : 'border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-100'
                      )}
                    >
                      <Icon
                        size={15}
                        className={cn(
                          'transition-colors duration-200 shrink-0',
                          isActive ? 'text-[#D4A76A]' : isOpen ? 'text-[#D4A76A]' : 'text-slate-500 group-hover:text-slate-700'
                        )}
                      />
                      <span>{rootLabel}</span>
                      <ChevronDown
                        size={13}
                        className={cn(
                          'transition-transform duration-200 shrink-0',
                          isOpen ? 'rotate-180' : '',
                          isActive ? 'text-white/80' : 'text-slate-400 group-hover:text-slate-600'
                        )}
                      />
                    </Link>
                  ) : (
                    <Link
                      href={`/categorie/${item.slug}`}
                      onClick={closeNow}
                      className={cn(
                        'group relative flex items-center gap-1.5 sm:gap-2 rounded-full px-3 py-1.5 md:px-3 lg:px-4 text-xs md:text-xs lg:text-sm font-semibold transition-all duration-200 border whitespace-nowrap shrink-0',
                        isActive
                          ? 'border-[#16254c] bg-[#16254c] text-white shadow-sm'
                          : 'border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-100'
                      )}
                    >
                      <Icon
                        size={15}
                        className={cn(
                          'transition-colors duration-200 shrink-0',
                          isActive ? 'text-[#D4A76A]' : 'text-slate-500 group-hover:text-slate-700'
                        )}
                      />
                      <span>{rootLabel}</span>
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
                      alignEnd={alignEnd}
                      allProductsLabel={t('allProducts')}
                    />
                  )}
                </div>
              )
            })}
          </div>

          <div className="ms-auto flex shrink-0 items-center pl-1 sm:pl-2">
            <Link
              href="/catalogue"
              className="inline-flex h-8 sm:h-8.5 lg:h-9 items-center gap-1.5 sm:gap-2 rounded-lg px-2.5 sm:px-3.5 lg:px-4 text-[11px] lg:text-xs font-bold tracking-wider uppercase transition-all duration-200 hover:opacity-90 whitespace-nowrap"
              style={{
                background: 'linear-gradient(135deg, #16254c 0%, #1f356b 100%)',
                color: '#fff',
                boxShadow: '0 2px 8px rgba(22,37,76,0.25)',
              }}
            >
              <span className="hidden sm:inline">{t('fullCatalog')}</span>
              <span className="sm:hidden">{t('catalog')}</span>
              <ChevronRight size={13} className={isRtl ? 'rotate-180' : ''} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Mobile Category Navigation (< md) ── */}
      <div ref={mobileNavRef} className="relative md:hidden border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        {/* Horizontal Category Pills Strip */}
        <nav
          aria-label={t('catalog')}
          className="flex overflow-x-auto hide-scrollbar py-2 px-3 gap-2"
        >
          {NAVIGATION_TAXONOMY.map((item) => {
            const Icon = NAVIGATION_ICONS[item.slug] ?? Package
            const root = findNode(categories, item.slug)
            const rootLabel = item.labelKey ? tTax(item.labelKey) : (root?.name ?? item.label ?? item.slug)
            const isActive = isItemActive(item, pathname)
            const isExpanded = mobileActiveCategory === item.slug
            const hasChildren = item.children && item.children.length > 0

            return (
              <button
                key={item.slug}
                type="button"
                onClick={() => {
                  if (hasChildren) {
                    setMobileActiveCategory((prev) => (prev === item.slug ? null : item.slug))
                  }
                }}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95 border whitespace-nowrap',
                  isExpanded
                    ? 'border-[#D4A76A] bg-[#16254c] text-white shadow-sm ring-1 ring-[#D4A76A]/50'
                    : isActive
                    ? 'border-[#16254c] bg-[#16254c] text-white shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                )}
                aria-expanded={isExpanded}
              >
                <Icon size={14} className={isExpanded || isActive ? 'text-[#D4A76A]' : 'text-slate-500'} />
                <span>{rootLabel}</span>
                {hasChildren && (
                  <ChevronDown
                    size={12}
                    className={cn(
                      'transition-transform duration-200 shrink-0',
                      isExpanded ? 'rotate-180 text-[#D4A76A]' : isActive ? 'text-white/80' : 'text-slate-400'
                    )}
                  />
                )}
              </button>
            )
          })}

          <Link
            href="/catalogue"
            className="flex shrink-0 items-center gap-1 rounded-full border border-brand-primary/20 bg-brand-surface px-3 py-1.5 text-xs font-bold text-brand-primary transition-all hover:bg-brand-primary hover:text-white whitespace-nowrap"
          >
            <span>{t('catalog')}</span>
            <ChevronRight size={12} className={isRtl ? 'rotate-180' : ''} />
          </Link>
        </nav>

        {/* Expandable Subcategories Panel (shown when a pill is tapped) */}
        {activeMobileItem && (
          <div className="border-t border-slate-200 bg-white shadow-xl animate-in slide-in-from-top-2 duration-200">
            {/* Header: Category Name + Direct link to full category + Close button */}
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-[#16254c] to-[#1f356b] text-white">
              <div className="flex items-center gap-2">
                <ActiveMobileIcon size={15} className="text-[#D4A76A]" />
                <span className="font-bold text-xs tracking-wider uppercase text-[#D4A76A]">
                  {activeMobileRootLabel}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/categorie/${activeMobileItem.slug}`}
                  onClick={() => setMobileActiveCategory(null)}
                  className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-white/20"
                >
                  <span>{t('allProducts')}</span>
                  <ChevronRight size={11} className={isRtl ? 'rotate-180' : ''} />
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileActiveCategory(null)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                  aria-label="Fermer"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Subcategories list */}
            <div className="max-h-[60vh] overflow-y-auto overscroll-contain p-3 space-y-2 divide-y divide-slate-100">
              {activeMobileItem.children.map((child) => {
                const dbChild = findNode(categories, child.slug)
                const childLabel = child.labelKey ? tTax(child.labelKey) : (dbChild?.name ?? child.label ?? child.slug)
                const hasLevel3 = child.children && child.children.length > 0
                const isChildActive = Boolean(pathname?.includes(`/categorie/${child.slug}`))

                return (
                  <div key={child.slug} className="pt-2 first:pt-0">
                    {/* Subcategory main row */}
                    <div className="flex items-center justify-between py-1">
                      <Link
                        href={(child.href || `/categorie/${child.slug}`) as any}
                        onClick={() => setMobileActiveCategory(null)}
                        className={cn(
                          'flex items-center gap-2 text-xs font-bold transition-colors py-0.5',
                          isChildActive ? 'text-[#16254c]' : 'text-slate-800 hover:text-brand-accent'
                        )}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#D4A76A]" />
                        <span>{childLabel}</span>
                      </Link>
                      <Link
                        href={(child.href || `/categorie/${child.slug}`) as any}
                        onClick={() => setMobileActiveCategory(null)}
                        className="text-[11px] font-medium text-slate-400 hover:text-[#16254c] flex items-center gap-0.5"
                      >
                        <ChevronRight size={12} className={isRtl ? 'rotate-180' : ''} />
                      </Link>
                    </div>

                    {/* Level 3 items (pills) */}
                    {hasLevel3 && (
                      <div className="flex flex-wrap gap-1.5 pl-3.5 pr-1 pb-1 pt-1">
                        {child.children!.map((subChild) => {
                          const subDb = dbChild?.children?.find((c) => c.slug === subChild.slug)
                          const subLabel = subChild.labelKey ? tTax(subChild.labelKey) : (subDb?.name ?? subChild.label ?? subChild.slug)
                          const targetHref = subChild.href || `/categorie/${subChild.slug}`
                          const isSubActive = Boolean(pathname?.includes(`/categorie/${subChild.slug}`))

                          return (
                            <Link
                              key={subChild.slug}
                              href={targetHref as any}
                              onClick={() => setMobileActiveCategory(null)}
                              className={cn(
                                'rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all',
                                isSubActive
                                  ? 'border-[#16254c] bg-[#16254c] text-white font-semibold shadow-xs'
                                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100 hover:text-[#16254c]'
                              )}
                            >
                              {subLabel}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Bottom Quick Action: Browse all products in category */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">
                {tTax('seeAll', { category: activeMobileRootLabel })}
              </span>
              <Link
                href={`/categorie/${activeMobileItem.slug}`}
                onClick={() => setMobileActiveCategory(null)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#16254c] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#1f356b] transition-colors"
              >
                <span>{t('allProducts')}</span>
                <ChevronRight size={12} className={isRtl ? 'rotate-180' : ''} />
              </Link>
            </div>
          </div>
        )}
      </div>
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
  alignEnd,
  allProductsLabel,
}: {
  item: (typeof NAVIGATION_TAXONOMY)[number]
  rootLabel: string
  categories: Category[] | undefined
  onClose: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  isRtl: boolean
  alignEnd?: boolean
  allProductsLabel: string
}) {
  const [activeChild, setActiveChild] = useState<string | null>(null)
  const tTax = useTranslations('Taxonomy')
  const pathname = usePathname()

  // Find which child is hovered (to show its sub-panel)
  const activeNode = item.children.find((c) => c.slug === activeChild)
  const hasSubPanel = activeNode && (activeNode.children?.length ?? 0) > 0

  return (
    <div
      role="menu"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "flyout-panel absolute top-full z-50 flex overflow-hidden before:absolute before:-top-3 before:left-0 before:right-0 before:h-4 before:content-['']",
        alignEnd ? (isRtl ? 'start-0' : 'end-0') : (isRtl ? 'end-0' : 'start-0')
      )}
      style={{
        borderRadius: '0 0 14px 14px',
        border: '1px solid rgba(22,37,76,0.1)',
        boxShadow: '0 16px 48px rgba(22,37,76,0.16)',
        minWidth: 260,
        maxWidth: 'min(500px, calc(100vw - 24px))',
        maxHeight: 'min(560px, calc(100vh - 125px))',
        background: '#fff',
        animation: 'flyoutIn 0.14s ease-out both',
      }}
    >
      {/* LEFT — category list */}
      <div
        className="flex flex-col max-h-[inherit]"
        style={{
          minWidth: 230,
          maxWidth: 260,
          borderRight: hasSubPanel ? '1px solid rgba(22,37,76,0.07)' : 'none',
        }}
      >
        {/* Panel header */}
        <div
          className="flex items-center justify-between px-4 py-2.5 shrink-0"
          style={{
            background: 'linear-gradient(135deg, #16254c 0%, #1f356b 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <span className="text-[11px] font-bold tracking-[0.14em] uppercase" style={{ color: '#D4A76A' }}>
            {rootLabel}
          </span>
          <Link
            href={`/categorie/${item.slug}`}
            onClick={onClose}
            className="flex items-center gap-1 text-[11px] font-medium transition-opacity hover:opacity-70"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            {allProductsLabel}
            <ChevronRight size={11} className={isRtl ? 'rotate-180' : ''} />
          </Link>
        </div>

        {/* Items */}
        <ul className="flex flex-col py-1.5 px-1.5 overflow-y-auto overscroll-contain gap-0.5">
          {item.children.map((child) => {
            const dbNode = findNode(categories, child.slug)
            const label = child.labelKey ? tTax(child.labelKey) : (dbNode?.name ?? child.label ?? child.slug)
            const hasSubs = (child.children?.length ?? 0) > 0
            const isHovered = activeChild === child.slug
            const isChildActive = pathname?.includes(`/categorie/${child.slug}`) || (child.children ?? []).some(sc => pathname?.includes(`/categorie/${sc.slug}`))

            return (
              <li key={child.slug} role="none">
                {hasSubs ? (
                  // Item with sub-children: hover or tap reveals right panel, clicking again navigates
                  <Link
                    href={`/categorie/${child.slug}`}
                    role="menuitem"
                    onClick={(e) => {
                      if (activeChild !== child.slug) {
                        e.preventDefault()
                        setActiveChild(child.slug)
                      } else {
                        onClose()
                      }
                    }}
                    onMouseEnter={() => setActiveChild(child.slug)}
                    className={cn(
                      'flyout-item group flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-xs transition-all duration-150',
                      isChildActive
                        ? 'border border-[#16254c] bg-[#16254c] text-white font-bold shadow-xs'
                        : isHovered
                        ? 'bg-[#D4A76A]/10 text-[#D4A76A] font-semibold'
                        : 'text-slate-700 hover:bg-slate-100/70'
                    )}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span
                        className={cn(
                          'h-1.5 w-1.5 shrink-0 rounded-full transition-colors',
                          isChildActive
                            ? 'bg-[#D4A76A]'
                            : isHovered
                            ? 'bg-[#D4A76A]'
                            : 'bg-slate-300 group-hover:bg-[#16254c]'
                        )}
                      />
                      <span className="font-semibold text-xs leading-none">{label}</span>
                    </span>
                    <ChevronRight
                      size={12}
                      className={cn(
                        'shrink-0 transition-colors',
                        isRtl ? 'rotate-180' : '',
                        isChildActive
                          ? 'text-white/80'
                          : isHovered
                          ? 'text-[#D4A76A]'
                          : 'text-slate-300 group-hover:text-slate-500'
                      )}
                    />
                  </Link>
                ) : (
                  // Leaf item: direct link
                  <Link
                    href={`/categorie/${child.slug}`}
                    role="menuitem"
                    onClick={onClose}
                    onMouseEnter={() => setActiveChild(null)}
                    className={cn(
                      'flyout-item group flex items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-xs transition-all duration-150',
                      isChildActive
                        ? 'border border-[#16254c] bg-[#16254c] text-white font-bold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100/70'
                    )}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span
                        className={cn(
                          'h-1.5 w-1.5 shrink-0 rounded-full transition-colors',
                          isChildActive
                            ? 'bg-[#D4A76A]'
                            : 'bg-slate-300 group-hover:bg-[#16254c]'
                        )}
                      />
                      <span className={cn('font-semibold text-xs leading-none', isChildActive ? 'text-white' : 'text-slate-700 group-hover:text-[#16254c]')}>
                        {label}
                      </span>
                    </span>
                  </Link>
                )}
              </li>
            )
          })}
        </ul>

        {/* Footer hint */}
        <div className="border-t px-4 py-2.5 shrink-0" style={{ borderColor: 'rgba(22,37,76,0.07)' }}>
          <Link
            href={`/categorie/${item.slug}`}
            onClick={onClose}
            className="flex items-center gap-1.5 text-[11px] font-semibold transition-opacity hover:opacity-70"
            style={{ color: '#D4A76A' }}
          >
            <span>{tTax('seeAll', { category: rootLabel })}</span>
            <ChevronRight size={11} className={isRtl ? 'rotate-180' : ''} />
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
  const pathname = usePathname()
  const label = node.labelKey ? tTax(node.labelKey) : (dbNode?.name ?? node.label ?? node.slug)

  return (
    <div
      className="flex flex-col max-h-[inherit]"
      style={{
        minWidth: 190,
        maxWidth: 230,
        background: 'linear-gradient(180deg, #fafbff 0%, #fff 100%)',
        animation: 'subPanelIn 0.15s ease both',
      }}
    >
      {/* Sub-panel header */}
      <div
        className="px-4 py-2.5 shrink-0"
        style={{
          background: 'rgba(212,167,106,0.08)',
          borderBottom: '1px solid rgba(212,167,106,0.2)',
        }}
      >
        <span className="text-[11px] font-bold tracking-[0.14em] uppercase" style={{ color: '#16254c' }}>
          {label}
        </span>
      </div>

      {/* Sub-items */}
      <ul className="flex flex-col py-1.5 px-1.5 overflow-y-auto overscroll-contain gap-0.5">
        {(node.children ?? []).map((subChild) => {
          const subDbNode = dbNode?.children?.find((c) => c.slug === subChild.slug)
          const subLabel = subChild.labelKey ? tTax(subChild.labelKey) : (subDbNode?.name ?? subChild.label ?? subChild.slug)
          const targetHref = subChild.href || `/categorie/${subChild.slug}`
          const isSubActive = pathname?.includes(`/categorie/${subChild.slug}`)

          return (
            <li key={subChild.slug} role="none">
              <Link
                href={targetHref}
                role="menuitem"
                onClick={onClose}
                className={cn(
                  'sub-item group flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-150',
                  isSubActive
                    ? 'border border-[#16254c] bg-[#16254c] text-white font-bold shadow-xs'
                    : 'text-[#16254c] hover:bg-slate-100/80'
                )}
              >
                <span
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all duration-150 group-hover:scale-110',
                    isSubActive ? 'bg-white/20' : 'bg-[#D4A76A]/15'
                  )}
                >
                  <span
                    className={cn('h-1 w-1 rounded-full', isSubActive ? 'bg-[#D4A76A]' : 'bg-[#D4A76A]')}
                  />
                </span>
                <span className={cn('transition-colors', isSubActive ? 'text-white font-bold' : 'group-hover:text-brand-accent')}>{subLabel}</span>
                <ChevronRight
                  size={11}
                  className={cn(
                    'ms-auto transition-all duration-150',
                    isRtl ? 'rotate-180' : '',
                    isSubActive ? 'text-white/80 opacity-100' : 'opacity-0 text-[#D4A76A] group-hover:opacity-100'
                  )}
                />
              </Link>
            </li>
          )
        })}
      </ul>

      {/* Link to parent category */}
      <div className="mt-auto border-t px-4 py-2.5 shrink-0" style={{ borderColor: 'rgba(22,37,76,0.07)' }}>
        <Link
          href={`/categorie/${node.slug}`}
          onClick={onClose}
          className="flex items-center gap-1.5 text-[11px] font-semibold transition-opacity hover:opacity-70"
          style={{ color: 'rgba(22,37,76,0.5)' }}
        >
          {allProductsLabel}
          <ChevronRight size={11} className={isRtl ? 'rotate-180' : ''} />
        </Link>
      </div>
    </div>
  )
}
