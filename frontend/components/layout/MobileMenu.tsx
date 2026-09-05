"use client";

import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/lib/api/categories'
import {
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Home,
  BookOpen,
  Info,
  Phone,
  Search,
  Car,
  Wrench,
  Bike,
  ShipWheel,
  Package,
} from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Link } from '@/i18n/routing'
import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { NAVIGATION_TAXONOMY } from '@/lib/navigation/taxonomy'

const NAVIGATION_ICONS: Record<string, React.ElementType> = {
  automobile: Car,
  'auto-pieces-rechange': Wrench,
  'moto-karting': Bike,
  marine: ShipWheel,
}

export default function MobileMenu() {
  const [open, setOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const tNav = useTranslations('Navigation')
  const tLayout = useTranslations('Layout')
  const tTax = useTranslations('Taxonomy')
  const locale = useLocale()
  const chevronRtlClass = locale === 'ar' ? 'rtl-flip' : ''

  const { data: categories } = useQuery({
    queryKey: ['categories-tree'],
    queryFn: categoriesApi.getTree,
  })

  const toggleCategory = (slug: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-primary text-white transition-all duration-200 hover:bg-brand-primary-light md:hidden" />
        }
      >
        <Menu size={20} />
        <span className="sr-only">{tLayout('openMenu')}</span>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-full overflow-y-auto border-r border-brand-border bg-brand-card p-0 sm:max-w-sm"
      >
        {/* Header */}
        <SheetHeader className="border-b border-brand-border px-6 py-5">
          <div className="flex items-center justify-between">
            <Link href="/" onClick={() => setOpen(false)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.jpg"
                alt="specpart"
                className="h-14 w-auto object-contain"
              />
            </Link>
            <SheetTitle className="sr-only">{tLayout('menu')}</SheetTitle>
          </div>
        </SheetHeader>

        {/* Content */}
        <div className="flex flex-col gap-1 px-4 py-6">

          {/* Quick links */}
          <Link
            href="/"
            className="flex min-h-11 items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-brand-primary/76 transition-all duration-150 hover:bg-brand-surface hover:text-brand-primary"
            onClick={() => setOpen(false)}
          >
            <Home size={17} className="text-brand-muted" />
            {tNav('home')}
          </Link>

          {/* Find My Oil — hero CTA */}
          <Link
            href="/#oil-finder"
            className="flex min-h-11 items-center gap-3 rounded-lg border border-brand-primary/10 bg-brand-surface px-4 py-3 text-sm font-semibold text-brand-primary transition-all duration-150 hover:bg-brand-surface-dark"
            onClick={() => setOpen(false)}
          >
            <Search size={17} className="text-brand-primary/60" />
            {tNav('findMyOil')}
          </Link>

          {/* Catalogue section */}
          <div className="mt-4 mb-2 flex items-center justify-between px-4">
            <p className="text-[11px] font-bold tracking-wider text-brand-muted uppercase">{tNav('catalog')}</p>
            <Link
              href="/catalogue"
              className="text-xs font-semibold text-brand-accent transition-colors hover:underline"
              onClick={() => setOpen(false)}
            >
              {tNav('fullCatalog')}
            </Link>
          </div>

          <div className="flex flex-col gap-1">
            {NAVIGATION_TAXONOMY.map((item) => {
              const Icon = NAVIGATION_ICONS[item.slug] ?? Package
              const isExpanded = expandedCategories.has(item.slug)
              const rootLabel = item.labelKey ? tTax(item.labelKey) : item.label || item.slug
              const hasChildren = item.children && item.children.length > 0

              return (
                <div key={item.slug} className="flex flex-col rounded-xl border border-brand-border/60 bg-brand-surface/30">
                  <div className="flex min-h-11 items-center justify-between px-3 py-2">
                    <Link
                      href={`/categorie/${item.slug}`}
                      className="flex flex-1 items-center gap-3 text-sm font-bold text-brand-primary transition-colors hover:text-brand-accent"
                      onClick={() => setOpen(false)}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary/8 text-brand-primary">
                        <Icon size={16} />
                      </div>
                      <span className="leading-tight">{rootLabel}</span>
                    </Link>

                    {hasChildren && (
                      <button
                        type="button"
                        onClick={() => toggleCategory(item.slug)}
                        aria-label={isExpanded ? 'Fermer' : 'Ouvrir'}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-brand-muted transition-colors hover:bg-brand-surface hover:text-brand-primary"
                      >
                        {isExpanded ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Accordion children */}
                  {hasChildren && isExpanded && (
                    <div className="border-t border-brand-border/40 bg-brand-card/70 px-3 py-2">
                      <Link
                        href={`/categorie/${item.slug}`}
                        className="flex min-h-8 items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold text-brand-accent transition-colors hover:bg-brand-surface"
                        onClick={() => setOpen(false)}
                      >
                        <ChevronRight size={12} className={chevronRtlClass} />
                        {tNav('allProducts')} {rootLabel}
                      </Link>

                      <div className="mt-1 flex flex-col gap-1">
                        {item.children.map((child) => {
                          const childLabel = child.labelKey ? tTax(child.labelKey) : child.label || child.slug
                          const hint = child.hintKey ? tTax(child.hintKey) : child.hint
                          const hasSubChildren = child.children && child.children.length > 0
                          const isSubExpanded = expandedCategories.has(child.slug)

                          return (
                            <div key={child.slug} className="flex flex-col rounded-lg bg-brand-surface/40 px-2 py-1.5">
                              <div className="flex items-center justify-between">
                                <Link
                                  href={(child.href || `/categorie/${child.slug}`) as any}
                                  className="flex flex-1 flex-col py-0.5"
                                  onClick={() => setOpen(false)}
                                >
                                  <span className="text-xs font-semibold text-brand-primary transition-colors hover:text-brand-accent">
                                    {childLabel}
                                  </span>
                                  {hint && (
                                    <span className="text-[10px] text-brand-muted line-clamp-1">
                                      {hint}
                                    </span>
                                  )}
                                </Link>

                                {hasSubChildren && (
                                  <button
                                    type="button"
                                    onClick={() => toggleCategory(child.slug)}
                                    className="p-1 text-brand-muted hover:text-brand-primary"
                                    aria-label="Toggle subcategory"
                                  >
                                    <ChevronDown
                                      size={13}
                                      className={`transition-transform duration-150 ${isSubExpanded ? 'rotate-180' : ''}`}
                                    />
                                  </button>
                                )}
                              </div>

                              {/* Level 3 items */}
                              {hasSubChildren && isSubExpanded && (
                                <div className="mt-1.5 flex flex-wrap gap-1 border-t border-brand-border/30 pt-1.5">
                                  {child.children!.map((subChild) => {
                                    const subChildLabel = subChild.labelKey ? tTax(subChild.labelKey) : subChild.label || subChild.slug
                                    const targetHref = subChild.href || `/categorie/${subChild.slug}`
                                    return (
                                      <Link
                                        key={subChild.slug}
                                        href={targetHref as any}
                                        className="rounded-md border border-brand-border/60 bg-brand-card px-2 py-1 text-[10px] font-medium text-brand-primary/80 transition-all hover:border-brand-accent hover:text-brand-accent"
                                        onClick={() => setOpen(false)}
                                      >
                                        {subChildLabel}
                                      </Link>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <Link
            href="/catalogue"
            className="mt-2 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-3 text-sm font-bold text-white shadow-sm transition-all duration-150 hover:bg-brand-primary-light"
            onClick={() => setOpen(false)}
          >
            <BookOpen size={16} />
            {tNav('fullCatalog')}
          </Link>

          {/* Bottom links */}
          <div className="mt-4 space-y-0.5 border-t border-brand-border pt-4">
            <Link
              href="/a-propos"
              className="flex min-h-11 items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-brand-primary/70 transition-all duration-150 hover:bg-brand-surface hover:text-brand-primary"
              onClick={() => setOpen(false)}
            >
              <Info size={17} className="text-brand-muted" />
              {tNav('about')}
            </Link>
            <Link
              href="/contact"
              className="flex min-h-11 items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-brand-primary/70 transition-all duration-150 hover:bg-brand-surface hover:text-brand-primary"
              onClick={() => setOpen(false)}
            >
              <Phone size={17} className="text-brand-muted" />
              {tNav('contact')}
            </Link>
          </div>

          {/* Gold accent bottom bar */}
          <div className="mx-4 mt-8 h-px bg-brand-border" />
          <p className="mt-4 text-center text-[11px] text-brand-muted">
            © {new Date().getFullYear()} specpart
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
