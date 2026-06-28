'use client'

import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/lib/api/categories'
import { CategoryGridSkeleton } from '@/components/common/Skeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { SectionTitle } from '@/components/common/SectionTitle'
import Link from 'next/link'
import Image from 'next/image'

export function CategoryGrid() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['featured-categories'],
    queryFn: categoriesApi.getFeatured,
  })

  return (
    <section className="section-padding py-16 bg-white">
      <SectionTitle 
        title="Parcourir par Catégorie" 
        centered
      />

      {isLoading ? (
        <CategoryGridSkeleton count={6} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : data && data.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {data.map((category) => (
            <Link 
              key={category.id} 
              href={`/categorie/${category.slug}`}
              className="group product-card p-6 flex flex-col items-center text-center hover:-translate-y-1 transition-transform"
            >
              <div className="w-16 h-16 relative bg-brand-surface rounded-full flex items-center justify-center mb-4 group-hover:bg-brand-primary/10 transition-colors">
                {category.image ? (
                  <Image src={category.image} alt={category.name} fill className="object-cover rounded-full" />
                ) : (
                  <span className="text-2xl">📦</span>
                )}
              </div>
              <h3 className="font-medium text-brand-primary group-hover:text-brand-accent transition-colors">
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
