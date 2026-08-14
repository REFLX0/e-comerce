"use client";

import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/lib/api/categories'
import { Menu, X, ChevronRight, ChevronDown, ChevronUp, Home, BookOpen, Info, Phone, Tag, Search } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Link } from '@/i18n/routing'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

export default function MobileMenu() {
  const [open, setOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const tNav = useTranslations('Navigation')
  const tLayout = useTranslations('Layout')

  const { data: categories } = useQuery({
    queryKey: ['categories-tree'],
    queryFn: categoriesApi.getTree,
  })

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
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
                className="h-9 w-auto object-contain"
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
          <div className="mt-2 mb-1 px-4">
            <p className="text-[10px] font-bold tracking-normal text-brand-muted uppercase">{tNav('catalog')}</p>
          </div>

          {categories && categories.length > 0 ? (
            <div className="flex flex-col gap-0.5">
              {categories.map((category) => {
                const hasChildren = category.children && category.children.length > 0
                const isExpanded = expandedCategories.has(category.id)
                return hasChildren ? (
                  <div key={category.id} className="flex flex-col">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="flex min-h-11 w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-brand-primary/76 transition-all duration-150 hover:bg-brand-surface hover:text-brand-primary"
                    >
                      <Tag size={17} className="shrink-0 text-brand-muted" />
                      <span className="flex-1 text-left">{category.name}</span>
                      {isExpanded ? (
                        <ChevronUp size={14} className="shrink-0 text-brand-muted transition-transform duration-150" />
                      ) : (
                        <ChevronDown size={14} className="shrink-0 text-brand-muted transition-transform duration-150" />
                      )}
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-200 ease-in-out ${
                        isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="ml-4 mb-2 flex flex-col gap-1 border-l-2 border-brand-border pl-4">
                        <Link
                          href={`/catalogue?categorySlug=${category.slug}`}
                          className="flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand-muted transition-all duration-150 hover:bg-brand-surface hover:text-brand-primary"
                          onClick={() => setOpen(false)}
                        >
                          <ChevronRight size={13} />
                          {tNav('allProducts')}
                        </Link>
                        {category.children?.map((sub) => (
                          <div key={sub.id} className="flex flex-col mb-2">
                            <Link
                              href={`/catalogue?categorySlug=${sub.slug}`}
                              className="flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-brand-primary transition-all duration-150 hover:bg-brand-surface hover:text-brand-accent"
                              onClick={() => setOpen(false)}
                            >
                              <ChevronRight size={13} />
                              {sub.name}
                            </Link>
                            {sub.children && sub.children.length > 0 && (
                              <div className="ml-5 mt-1 flex flex-col gap-0.5 border-l border-brand-border/50 pl-3">
                                {sub.children.map((child) => (
                                  <Link
                                    key={child.id}
                                    href={`/catalogue?categorySlug=${child.slug}`}
                                    className="flex min-h-9 items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-brand-muted transition-all duration-150 hover:bg-brand-surface hover:text-brand-primary"
                                    onClick={() => setOpen(false)}
                                  >
                                    <span className="h-1 w-1 rounded-full bg-brand-primary/20" />
                                    {child.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={category.id}
                    href={`/catalogue?categorySlug=${category.slug}`}
                    className="flex min-h-11 w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-brand-primary/76 transition-all duration-150 hover:bg-brand-surface hover:text-brand-primary"
                    onClick={() => setOpen(false)}
                  >
                    <Tag size={17} className="shrink-0 text-brand-muted" />
                    <span className="flex-1">{category.name}</span>
                    <ChevronRight size={14} className="shrink-0 text-brand-muted" />
                  </Link>
                )
              })}
            </div>
          ) : (
            <Link
              href="/catalogue"
              className="flex min-h-11 items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-brand-primary/76 transition-all duration-150 hover:bg-brand-surface hover:text-brand-primary"
              onClick={() => setOpen(false)}
            >
              <BookOpen size={17} className="text-brand-muted" />
              {tNav('viewAllCatalog')}
            </Link>
          )}

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
