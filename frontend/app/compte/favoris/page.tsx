'use client'

import { useWishlistStore } from '@/lib/store/wishlist.store'
import { ProductGrid } from '@/components/catalogue/ProductGrid'
import { Heart } from 'lucide-react'
import Link from 'next/link'

export default function AccountWishlistPage() {
  const { items } = useWishlistStore()

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-brand-primary mb-6 border-b border-gray-100 pb-4">
        Mes Favoris
      </h1>

      {items.length > 0 ? (
        <ProductGrid products={items} />
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-brand-surface rounded-full flex items-center justify-center mx-auto mb-4 text-red-200">
            <Heart size={32} />
          </div>
          <h3 className="text-lg font-bold text-brand-primary mb-2">Votre liste de favoris est vide</h3>
          <p className="text-gray-500 mb-6">Explorez notre catalogue et ajoutez des articles à vos favoris.</p>
          <Link href="/catalogue" className="btn-secondary inline-flex">
            Parcourir le catalogue
          </Link>
        </div>
      )}
    </div>
  )
}
