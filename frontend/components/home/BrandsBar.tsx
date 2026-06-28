'use client'

import { useQuery } from '@tanstack/react-query'
import { brandsApi } from '@/lib/api/brands'
import Image from 'next/image'
import Link from 'next/link'

export function BrandsBar() {
  const { data: brands, isLoading } = useQuery({
    queryKey: ['featured-brands'],
    queryFn: brandsApi.getFeatured,
  })

  if (isLoading || !brands || brands.length === 0) return null

  return (
    <section className="border-y border-brand-surface-dark bg-white py-10 overflow-hidden">
      <div className="section-padding">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 justify-center">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest shrink-0">
            Nos Marques Partenaires
          </p>
          <div className="flex items-center gap-8 md:gap-16 overflow-x-auto hide-scrollbar w-full md:w-auto">
            {brands.map((brand) => (
              <Link 
                key={brand.id} 
                href={`/marque/${brand.slug}`}
                className="opacity-50 hover:opacity-100 transition-opacity shrink-0 flex items-center justify-center w-24 h-12 relative"
                title={brand.name}
              >
                {brand.logo ? (
                  <Image 
                    src={brand.logo} 
                    alt={brand.name} 
                    fill 
                    className="object-contain"
                  />
                ) : (
                  <span className="font-display font-bold text-lg text-brand-primary">{brand.name}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
