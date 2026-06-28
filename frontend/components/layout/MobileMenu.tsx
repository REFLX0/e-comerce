'use client'

import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/lib/api/categories'
import { Menu } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import Link from 'next/link'
import { useState } from 'react'

export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const { data: categories } = useQuery({
    queryKey: ['categories-tree'],
    queryFn: categoriesApi.getTree,
  })

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<button className="md:hidden p-2 text-brand-primary hover:text-brand-primary-light" />}>
          <Menu size={24} />
          <span className="sr-only">Ouvrir le menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-sm overflow-y-auto bg-white">
        <SheetHeader>
          <SheetTitle className="text-left font-display font-bold text-xl text-brand-primary border-b pb-4">
            Menu
          </SheetTitle>
        </SheetHeader>
        
        <div className="py-4 space-y-4">
          <Link
            href="/"
            className="block text-lg font-medium text-gray-700 hover:text-brand-primary"
            onClick={() => setOpen(false)}
          >
            Accueil
          </Link>
          
          <div className="pt-2 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">
              Catalogue
            </h3>
            
            {categories && categories.length > 0 ? (
              <Accordion className="w-full">
                {categories.map((category) => (
                  <AccordionItem key={category.id} value={category.id} className="border-b-0">
                    <AccordionTrigger className="py-3 text-base font-medium hover:no-underline hover:text-brand-primary">
                      {category.name}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col space-y-2 pl-4 border-l-2 border-brand-surface-dark py-1">
                        <Link
                          href={`/categorie/${category.slug}`}
                          className="text-gray-600 py-1 hover:text-brand-primary"
                          onClick={() => setOpen(false)}
                        >
                          Tous les produits
                        </Link>
                        {category.children?.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/categorie/${sub.slug}`}
                            className="text-gray-600 py-1 hover:text-brand-primary"
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
                className="block text-lg font-medium text-gray-700 hover:text-brand-primary py-2"
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
