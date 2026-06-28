'use client'

import { useQuery } from '@tanstack/react-query'
import { productsApi } from '@/lib/api/products'
import { ProductGrid } from '@/components/catalogue/ProductGrid'
import { SectionTitle } from '@/components/common/SectionTitle'
import { ProductGridSkeleton } from '@/components/common/Skeleton'

interface Props {
  productId: string
}

export function RelatedProducts({ productId }: Props) {
  const { data: products, isLoading } = useQuery({
    queryKey: ['related-products', productId],
    queryFn: () => productsApi.getRelated(productId),
  })

  if (!isLoading && (!products || products.length === 0)) return null

  return (
    <section className="mt-24">
      <SectionTitle title="Produits Similaires" />
      
      {isLoading ? (
        <ProductGridSkeleton count={4} />
      ) : (
        <ProductGrid products={products || []} />
      )}
    </section>
  )
}
