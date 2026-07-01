"use client";

import { useQuery } from '@tanstack/react-query'
import { brandsApi } from '@/lib/api/brands'
import Image from 'next/image'
import { Link } from '@/i18n/routing'

export function BrandsBar() {
  const { data: brands, isLoading } = useQuery({
    queryKey: ['featured-brands'],
    queryFn: brandsApi.getFeatured,
  })

  if (isLoading || !brands || brands.length === 0) return null

  // Duplicate for seamless infinite scroll
  const doubled = [...brands, ...brands]

  return (
    <section className="relative overflow-hidden border-y border-brand-border bg-white py-10">
      {/* Fade masks on left & right edges */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-white to-transparent" />

      <div className="section-padding mb-6">
        <p className="text-center text-xs font-bold tracking-[0.2em] text-gray-300 uppercase">
          Nos Marques Partenaires
        </p>
      </div>

      {/* Marquee track */}
      <div className="flex w-full overflow-hidden">
        <div className="animate-marquee flex shrink-0 items-center gap-12 px-6 md:gap-20">
          {doubled.map((brand, idx) => (
            <Link
              key={`${brand.id}-${idx}`}
              href={`/marque/${brand.slug}`}
              title={brand.name}
              className="relative flex h-10 w-28 shrink-0 items-center justify-center opacity-35 transition-opacity duration-300 hover:opacity-100 md:h-12 md:w-32"
            >
              {brand.logo ? (
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  fill
                  className="object-contain grayscale hover:grayscale-0 transition-all duration-300"
                />
              ) : (
                <span className="font-display text-brand-primary text-base font-black uppercase tracking-tighter">
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
