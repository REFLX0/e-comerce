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

  return (
    <section className="border-brand-surface-dark overflow-hidden border-y bg-white py-10">
      <div className="section-padding">
        <div className="flex flex-col items-center justify-center gap-8 md:flex-row md:gap-12">
          <p className="shrink-0 text-sm font-semibold tracking-widest text-gray-400 uppercase">
            Nos Marques Partenaires
          </p>
          <div className="hide-scrollbar flex w-full items-center gap-8 overflow-x-auto md:w-auto md:gap-16">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/marque/${brand.slug}`}
                className="relative flex h-12 w-24 shrink-0 items-center justify-center opacity-50 transition-opacity hover:opacity-100"
                title={brand.name}
              >
                {brand.logo ? (
                  <Image src={brand.logo} alt={brand.name} fill className="object-contain" />
                ) : (
                  <span className="font-display text-brand-primary-light text-xl font-black uppercase tracking-tighter opacity-80">
                    {brand.name}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
