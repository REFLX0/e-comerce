"use client";

import { useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { brandsApi } from '@/lib/api/brands'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function BrandsBar() {
  const { data: brands, isLoading } = useQuery({
    queryKey: ['all-brands'],
    queryFn: brandsApi.getAll,
  })
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir === 'right' ? 200 : -200, behavior: 'smooth' })
  }

  if (isLoading || !brands || brands.length === 0) return null

  return (
    <section className="border-y border-gray-100 bg-white py-12">
      <div className="section-padding">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-accent">
              Partenaires officiels
            </p>
            <h2 className="mt-1 text-2xl font-black uppercase tracking-tight text-brand-primary">
              Marques de Confiance
            </h2>
          </div>
          {/* Arrows */}
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-all hover:border-brand-primary hover:text-brand-primary"
              aria-label="Précédent"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-all hover:border-brand-primary hover:text-brand-primary"
              aria-label="Suivant"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable brand logos */}
        <div
          ref={scrollRef}
          className="hide-scrollbar flex gap-4 overflow-x-auto pb-2"
        >
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/marque/${brand.slug}`}
              title={brand.name}
              className="relative flex h-16 w-28 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 opacity-60 transition-all duration-200 hover:border-gray-200 hover:bg-white hover:opacity-100 hover:shadow-md md:h-20 md:w-36"
            >
              {brand.logo ? (
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  fill
                  className="object-contain p-3 grayscale transition-all duration-200 hover:grayscale-0"
                />
              ) : (
                <span className="font-black text-sm uppercase tracking-tight text-brand-primary">
                  {brand.name}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
