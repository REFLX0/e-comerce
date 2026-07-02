"use client";

import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/lib/api/categories'
import { CategoryGridSkeleton } from '@/components/common/Skeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { SectionTitle } from '@/components/common/SectionTitle'
import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { Package } from 'lucide-react'

export function CategoryGrid() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['featured-categories'],
    queryFn: categoriesApi.getFeatured,
  })

  return (
    <section className="section-padding bg-brand-card py-16 md:py-20">
      <SectionTitle
        title="Parcourir par catégorie"
        subtitle="Accédez rapidement aux familles de produits les plus demandées."
        centered
      />

      {isLoading ? (
        <CategoryGridSkeleton count={6} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : data && data.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
          {data.map((category) => (
            <Link
              key={category.id}
              href={`/categorie/${category.slug}`}
              className="group product-card flex min-h-40 flex-col items-center p-4 text-center sm:p-5"
            >
              <div className="relative mb-4 flex h-20 w-full items-center justify-center overflow-hidden rounded-lg border border-brand-border bg-brand-surface transition-colors duration-200 group-hover:bg-brand-accent/10">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Package size={30} className="text-brand-muted transition-colors duration-200 group-hover:text-brand-primary" />
                )}
              </div>
              <h3 className="line-clamp-2 text-sm font-semibold text-brand-primary transition-colors duration-200 group-hover:text-brand-accent">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">Aucune catégorie disponible.</p>
      )}
    </section>
  )
}
