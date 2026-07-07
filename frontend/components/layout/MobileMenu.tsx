"use client";

import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/lib/api/categories'
import { Menu, X, ChevronRight, ChevronDown, ChevronUp, Home, BookOpen, Info, Phone, Tag, Search } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Link } from '@/i18n/routing'
import { useState } from 'react'
import Image from 'next/image'

export default function MobileMenu() {
  const [open, setOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
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
        <span className="sr-only">Ouvrir le menu</span>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-full overflow-y-auto border-r border-brand-border bg-brand-card p-0 sm:max-w-sm"
      >
        {/* Header */}
        <SheetHeader className="border-b border-brand-border px-6 py-5">
          <div className="flex items-center justify-between">
            <Link href="/" onClick={() => setOpen(false)}>
              <Image
                src="/logo.png"
                alt="KiosqueTN"
                width={120}
                height={36}
                className="h-9 w-auto object-contain"
              />
            </Link>
            <SheetTitle className="sr-only">Menu</SheetTitle>
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
            <Home size={17} className="text-brand-accent" />
            Accueil
          </Link>

          {/* Find My Oil — hero CTA */}
          <Link
            href="/#oil-finder"
            className="flex min-h-11 items-center gap-3 rounded-lg border border-brand-accent/25 bg-brand-accent/10 px-4 py-3 text-sm font-semibold text-brand-primary transition-all duration-150 hover:bg-brand-accent/20"
            onClick={() => setOpen(false)}
          >
            <Search size={17} className="text-brand-accent" />
            Trouver mon huile
          </Link>

          {/* Catalogue section */}
          <div className="mt-2 mb-1 px-4">
            <p className="text-[10px] font-bold tracking-normal text-brand-muted uppercase">Catalogue</p>
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
                      <Tag size={17} className="shrink-0 text-brand-accent" />
                      <span className="flex-1 text-left">{category.name}</span>
                      {isExpanded ? (
                        <ChevronUp size={14} className="shrink-0 text-brand-muted transition-transform duration-150" />
                      ) : (
                        <ChevronDown size={14} className="shrink-0 text-brand-muted transition-transform duration-150" />
                      )}
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-200 ease-in-out ${
                        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="ml-4 mb-1 flex flex-col gap-0.5 border-l-2 border-brand-accent/25 pl-4">
                        <Link
                          href={`/categorie/${category.slug}`}
                          className="flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand-muted transition-all duration-150 hover:bg-brand-surface hover:text-brand-primary"
                          onClick={() => setOpen(false)}
                        >
                          <ChevronRight size={13} />
                          Tous les produits
                        </Link>
                        {category.children?.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/categorie/${sub.slug}`}
                            className="flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand-muted transition-all duration-150 hover:bg-brand-surface hover:text-brand-primary"
                            onClick={() => setOpen(false)}
                          >
                            <ChevronRight size={13} />
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={category.id}
                    href={`/categorie/${category.slug}`}
                    className="flex min-h-11 w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-brand-primary/76 transition-all duration-150 hover:bg-brand-surface hover:text-brand-primary"
                    onClick={() => setOpen(false)}
                  >
                    <Tag size={17} className="shrink-0 text-brand-accent" />
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
              <BookOpen size={17} className="text-brand-accent" />
              Voir tout le catalogue
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
              À propos
            </Link>
            <Link
              href="/contact"
              className="flex min-h-11 items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-brand-primary/70 transition-all duration-150 hover:bg-brand-surface hover:text-brand-primary"
              onClick={() => setOpen(false)}
            >
              <Phone size={17} className="text-brand-muted" />
              Contact
            </Link>
          </div>

          {/* Gold accent bottom bar */}
          <div className="mx-4 mt-8 h-px bg-brand-border" />
          <p className="mt-4 text-center text-[11px] text-brand-muted">
            © {new Date().getFullYear()} KiosqueTN
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
