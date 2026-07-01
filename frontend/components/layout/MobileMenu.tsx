"use client";

import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/lib/api/categories'
import { Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import Link from 'next/link'
import { useState } from 'react'

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
          <button className="text-brand-primary hover:text-brand-primary-light p-2 md:hidden" />
        }
      >
        <Menu size={24} />
        <span className="sr-only">Ouvrir le menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-full overflow-y-auto bg-white sm:max-w-sm">
        <SheetHeader>
          <SheetTitle className="font-display text-brand-primary border-b pb-4 text-left text-xl font-bold">
            Menu
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4 py-4">
          <Link
            href="/"
            className="hover:text-brand-primary block text-lg font-medium text-gray-700"
            onClick={() => setOpen(false)}
          >
            Accueil
          </Link>

          <div className="border-t border-gray-100 pt-2">
            <h3 className="mb-2 text-sm font-semibold tracking-wider text-gray-400 uppercase">
              Catalogue
            </h3>

            {categories && categories.length > 0 ? (
              <Accordion className="w-full">
                {categories.map((category) => (
                  <AccordionItem key={category.id} value={category.id} className="border-b-0">
                    <AccordionTrigger className="hover:text-brand-primary py-3 text-base font-medium hover:no-underline">
                      {category.name}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="border-brand-surface-dark flex flex-col space-y-2 border-l-2 py-1 pl-4">
                        <Link
                          href={`/categorie/${category.slug}`}
                          className="hover:text-brand-primary py-1 text-gray-600"
                          onClick={() => setOpen(false)}
                        >
                          Tous les produits
                        </Link>
                        {category.children?.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/categorie/${sub.slug}`}
                            className="hover:text-brand-primary py-1 text-gray-600"
                            onClick={() => setOpen(false)}
                          >
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
                className="hover:text-brand-primary block py-2 text-lg font-medium text-gray-700"
                onClick={() => setOpen(false)}
              >
                Voir tout le catalogue
              </Link>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
