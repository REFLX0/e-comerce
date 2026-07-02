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

  const doubled = [...brands, ...brands]

  return (
    <section className="relative overflow-hidden border-y border-brand-border bg-brand-card py-10">
      <div className="pointer-events-none absolute top-0 left-0 z-10 h-full w-20 bg-gradient-to-r from-brand-card to-transparent sm:w-28" />
      <div className="pointer-events-none absolute top-0 right-0 z-10 h-full w-20 bg-gradient-to-l from-brand-card to-transparent sm:w-28" />

      <div className="section-padding mb-6">
        <p className="text-center text-xs font-bold uppercase tracking-normal text-brand-muted">
          Nos marques partenaires
        </p>
      </div>

      <div className="flex w-full overflow-hidden">
        <div className="animate-marquee flex shrink-0 items-center gap-10 px-6 md:gap-16">
          {doubled.map((brand, idx) => (
            <Link
              key={`${brand.id}-${idx}`}
              href={`/marque/${brand.slug}`}
              title={brand.name}
              className="relative flex h-11 w-28 shrink-0 items-center justify-center rounded-lg opacity-55 transition-all duration-200 hover:bg-brand-surface hover:opacity-100 md:h-12 md:w-32"
            >
              {brand.logo ? (
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  fill
                  className="object-contain p-2 grayscale transition-all duration-200 hover:grayscale-0"
                />
              ) : (
                <span className="font-display text-base font-black uppercase tracking-normal text-brand-primary">
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
