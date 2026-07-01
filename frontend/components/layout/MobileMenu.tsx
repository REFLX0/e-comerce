"use client";

import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/lib/api/categories'
import { Menu, X, ChevronRight, Home, BookOpen, Info, Phone, Tag } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Link } from '@/i18n/routing'
import { useState } from 'react'
import Image from 'next/image'

export default function MobileMenu() {
  const [open, setOpen] = useState(false)
  const { data: categories } = useQuery({
    queryKey: ['categories-tree'],
    queryFn: categoriesApi.getTree,
  })

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/8 text-white hover:bg-white/14 transition-all duration-200 md:hidden" />
        }
      >
        <Menu size={20} />
        <span className="sr-only">Ouvrir le menu</span>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-full overflow-y-auto border-r border-white/8 bg-brand-primary p-0 sm:max-w-sm"
      >
        {/* Header */}
        <SheetHeader className="border-b border-white/8 px-6 py-5">
          <div className="flex items-center justify-between">
            <Link href="/" onClick={() => setOpen(false)}>
              <Image
                src="/logo.png"
                alt="KiosqueTN"
                width={120}
                height={36}
                className="h-8 w-auto object-contain brightness-0 invert"
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
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/8 hover:text-white transition-all duration-150"
            onClick={() => setOpen(false)}
          >
            <Home size={17} className="text-brand-accent" />
            Accueil
          </Link>

          {/* Catalogue section */}
          <div className="mt-2 mb-1 px-4">
            <p className="text-[10px] font-bold tracking-[0.15em] text-white/25 uppercase">Catalogue</p>
          </div>

          {categories && categories.length > 0 ? (
            <Accordion className="w-full space-y-0.5">
              {categories.map((category) => (
                <AccordionItem key={category.id} value={category.id} className="border-0">
                  <AccordionTrigger className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/8 hover:text-white transition-all duration-150 hover:no-underline [&[data-state=open]]:bg-white/8 [&[data-state=open]]:text-brand-accent">
                    <Tag size={17} className="shrink-0 text-brand-accent" />
                    {category.name}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="ml-4 mt-1 mb-2 flex flex-col space-y-0.5 border-l-2 border-brand-accent/20 pl-4">
                      <Link
                        href={`/categorie/${category.slug}`}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/50 hover:text-white hover:bg-white/6 transition-all"
                        onClick={() => setOpen(false)}
                      >
                        <ChevronRight size={13} />
                        Tous les produits
                      </Link>
                      {category.children?.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/categorie/${sub.slug}`}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/50 hover:text-white hover:bg-white/6 transition-all"
                          onClick={() => setOpen(false)}
                        >
                          <ChevronRight size={13} />
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <Link
              href="/catalogue"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/8 hover:text-white transition-all duration-150"
              onClick={() => setOpen(false)}
            >
              <BookOpen size={17} className="text-brand-accent" />
              Voir tout le catalogue
            </Link>
          )}

          {/* Bottom links */}
          <div className="mt-4 border-t border-white/8 pt-4 space-y-0.5">
            <Link
              href="/a-propos"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/60 hover:bg-white/8 hover:text-white transition-all duration-150"
              onClick={() => setOpen(false)}
            >
              <Info size={17} className="text-white/40" />
              À propos
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/60 hover:bg-white/8 hover:text-white transition-all duration-150"
              onClick={() => setOpen(false)}
            >
              <Phone size={17} className="text-white/40" />
              Contact
            </Link>
          </div>

          {/* Gold accent bottom bar */}
          <div className="mt-8 mx-4 h-px bg-gradient-to-r from-transparent via-brand-accent/40 to-transparent" />
          <p className="mt-4 text-center text-[11px] text-white/20">
            © {new Date().getFullYear()} KiosqueTN
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
