"use client";

import { useQuery } from '@tanstack/react-query'
import { productsApi } from '@/lib/api/products'
import { ProductGrid } from '@/components/catalogue/ProductGrid'
import { ProductGridSkeleton } from '@/components/common/Skeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { SectionTitle } from '@/components/common/SectionTitle'

export function BestSellers() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['best-sellers'],
    queryFn: () => productsApi.getBestSellers(8),
  })

  return (
    <section className="section-padding bg-brand-surface py-16 md:py-20">
      <SectionTitle
        title="Meilleures ventes"
        subtitle="Les huiles et pièces qui reviennent le plus souvent dans les paniers clients."
        centered
      />

      {isLoading ? (
        <ProductGridSkeleton count={8} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : data && data.length > 0 ? (
        <ProductGrid products={data} />
      ) : (
        <p className="text-center text-gray-500">Aucun produit disponible pour le moment.</p>
      )}
    </section>
  )
}
