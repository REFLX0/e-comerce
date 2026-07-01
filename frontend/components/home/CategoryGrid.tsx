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
    <section className="section-padding bg-white py-16">
      <SectionTitle title="Parcourir par Catégorie" centered />

      {isLoading ? (
        <CategoryGridSkeleton count={6} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : data && data.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {data.map((category) => (
            <Link
              key={category.id}
              href={`/categorie/${category.slug}`}
              className="group product-card flex flex-col items-center p-6 text-center transition-transform hover:-translate-y-1"
            >
              <div className="bg-brand-surface group-hover:bg-brand-primary/10 relative mb-4 flex h-24 w-24 items-center justify-center rounded-full transition-colors overflow-hidden border-4 border-white shadow-sm group-hover:border-brand-surface">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Package size={32} className="text-gray-400 group-hover:text-brand-primary transition-colors" />
                )}
              </div>
              <h3 className="text-brand-primary group-hover:text-brand-accent font-medium transition-colors line-clamp-2">
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
