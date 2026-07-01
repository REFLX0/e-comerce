"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { wishlistApi } from '@/lib/api/wishlist'
import { useAuthStore } from '@/lib/store/auth.store'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'

export default function WishlistPage() {
    const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistApi.getAll(),
    enabled: true,
  })

  const items = data?.data ?? []

  const toggleMutation = useMutation({
    mutationFn: (productId: string) => wishlistApi.toggle(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      toast.success('Liste de souhaits mise à jour')
    },
    onError: () => toast.error('Erreur de mise à jour'),
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Ma Liste de souhaits</h1>
          <p className="text-sm text-gray-500">{items.length} produit(s) sauvegardé(s)</p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-gray-400">Chargement...</div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center">
          <Heart size={48} className="mx-auto mb-4 text-gray-200" />
          <p className="font-semibold text-gray-400">Votre liste est vide</p>
          <Link href="/catalogue" className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-black hover:bg-brand-accent-hover transition-colors">
            Explorer le catalogue
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map(({ id, product }: any) => {
            // we assume the first variant holds the price/stock
            const variant = product.variants?.[0]
            const price = variant?.price ?? 0
            const inStock = (variant?.stockQty ?? 0) > 0
            const imageUrl = product.images?.[0]?.url ?? 'https://images.unsplash.com/photo-1580983561371-7f4b242d8ec0?w=400&q=80'

            return (
              <div key={id} className="group flex gap-4 rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                <Link href={`/produit/${product.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                  <Image src={imageUrl} alt={product.nameFr} fill className="object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/produit/${product.slug}`}>
                    <p className="truncate text-sm font-semibold text-brand-primary hover:text-brand-accent transition-colors">{product.nameFr}</p>
                  </Link>
                  <p className="text-xs text-gray-400">{product.brand?.name}</p>
                  <p className="mt-1 font-bold text-brand-primary">
                    {price.toLocaleString('fr-TN', { minimumFractionDigits: 2 })} TND
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      disabled={!inStock}
                      className="flex items-center gap-1.5 rounded-xl bg-brand-accent px-3 py-1.5 text-xs font-semibold text-black hover:bg-brand-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart size={13} />
                      {inStock ? 'Ajouter au panier' : 'Rupture'}
                    </button>
                    <button
                      onClick={() => toggleMutation.mutate(product.id)}
                      className="rounded-xl p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

