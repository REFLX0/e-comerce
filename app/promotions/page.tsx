'use client'

import { useQuery } from '@tanstack/react-query'
import { productsApi } from '@/lib/api/products'
import { ProductGrid } from '@/components/catalogue/ProductGrid'
import { ProductGridSkeleton } from '@/components/common/Skeleton'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Percent, Tag, Flame } from 'lucide-react'

export default function PromotionsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products', 'promos'],
    queryFn: () => productsApi.getAll({ isPromo: true, limit: 20 }),
  })

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 text-white py-16 md:py-24">
        <div className="section-padding text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Flame size={18} />
            <span className="text-sm font-medium">Offres limitées</span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl mb-4">
            Nos Promotions
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Profitez de réductions exceptionnelles sur une sélection de lubrifiants et huiles moteur de grandes marques.
          </p>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-white border-b">
        <div className="section-padding py-6">
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Percent size={18} className="text-red-500" />
              <span>Jusqu&apos;à -40% de réduction</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag size={18} className="text-red-500" />
              <span>Produits 100% authentiques</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame size={18} className="text-red-500" />
              <span>Stock limité</span>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="section-padding py-12">
        <Breadcrumb items={[{ label: 'Promotions' }]} />

        <div className="mt-8">
          {isLoading && <ProductGridSkeleton />}
          {error && <ErrorState message="Impossible de charger les promotions." onRetry={() => window.location.reload()} />}
          {data && data.data.length === 0 && (
            <EmptyState
              title="Aucune promotion en cours"
              message="Revenez bientôt pour découvrir nos nouvelles offres !"
              action={{ label: "Voir le catalogue", href: "/catalogue" }}
            />
          )}
          {data && data.data.length > 0 && (
            <ProductGrid products={data.data} />
          )}
        </div>
      </section>
    </>
  )
}
