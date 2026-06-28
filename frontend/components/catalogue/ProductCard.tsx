'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, Scale, ShoppingCart } from 'lucide-react'
import type { Product } from '@/lib/types'
import { useCartStore } from '@/lib/store/cart.store'
import { useWishlistStore } from '@/lib/store/wishlist.store'
import { useComparatorStore } from '@/lib/store/comparator.store'
import { PriceDisplay } from '../common/PriceDisplay'
import { RatingStars } from '../common/RatingStars'
import { toast } from 'sonner'
import { StockIndicator } from '../common/StockIndicator'

interface Props {
  product: Product
}

export function ProductCard({ product }: Props) {
  const { addItem } = useCartStore()
  const { items: wishlistItems, toggle: toggleWishlist } = useWishlistStore()
  const { items: compareItems, toggle: toggleCompare } = useComparatorStore()

  const isFavorite = wishlistItems.some((p) => p.id === product.id)
  const isCompared = compareItems.some((p) => p.id === product.id)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    // By default, add the first variant
    if (product.variants.length > 0) {
      addItem(product, product.variants[0], 1)
      toast.success('Produit ajouté au panier')
    }
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    // For now, assume unauthenticated for token.
    toggleWishlist(product)
    if (!isFavorite) toast.success('Ajouté aux favoris')
    else toast.info('Retiré des favoris')
  }

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault()
    toggleCompare(product)
    if (!isCompared) toast.success('Ajouté au comparateur')
    else toast.info('Retiré du comparateur')
  }

  const defaultVariant = product.variants[0]
  const oldPrice = defaultVariant?.priceHT * 1.2 // Mocking old price for demo logic if promo

  return (
    <Link href={`/produit/${product.slug}`} className="group product-card p-4 relative block">
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {product.isPromo && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            PROMO {product.promoPercent ? `-${product.promoPercent}%` : ''}
          </span>
        )}
        {product.isNew && (
          <span className="bg-brand-primary text-white text-xs font-bold px-2 py-1 rounded">
            NOUVEAU
          </span>
        )}
      </div>

      {/* Actions Hover */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
        <button
          onClick={handleToggleWishlist}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-soft hover:bg-brand-primary hover:text-white transition-colors text-gray-400"
          title="Favoris"
        >
          <Heart size={20} className={isFavorite ? 'fill-red-500 text-red-500' : ''} />
        </button>
        <button
          onClick={handleToggleCompare}
          className={`w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-soft hover:bg-brand-primary hover:text-white transition-colors ${isCompared ? 'text-brand-primary' : 'text-gray-400'}`}
          title="Comparer"
        >
          <Scale size={20} />
        </button>
      </div>

      {/* Image */}
      <div className="relative aspect-square bg-brand-surface rounded-xl overflow-hidden mb-4">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400 text-sm">Image non disponible</span>
          </div>
        )}
      </div>

      {/* Brand & Category */}
      <div className="flex items-center justify-between mb-2">
        {product.brand && (
          <span className="text-xs font-semibold uppercase text-brand-primary tracking-wider">
            {product.brand.name}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-medium text-brand-primary mb-1 line-clamp-2 min-h-[48px] group-hover:text-brand-accent transition-colors">
        {product.name}
      </h3>

      {/* Rating */}
      <div className="mb-3">
        <RatingStars rating={product.rating} count={product.reviewCount} />
      </div>

      {/* Stock */}
      <div className="mb-4">
        <StockIndicator status={defaultVariant?.status || 'out_of_stock'} />
      </div>

      {/* Price & Add to Cart */}
      <div className="flex items-end justify-between mt-auto pt-4 border-t border-brand-surface-dark">
        {defaultVariant ? (
          <PriceDisplay
            priceHT={defaultVariant.priceHT}
            priceTTC={defaultVariant.priceTTC}
            isPromo={product.isPromo}
            promoPercent={product.promoPercent}
            oldPriceHT={oldPrice}
          />
        ) : (
          <span className="text-sm text-gray-500">Prix non disponible</span>
        )}
        
        <button
          onClick={handleAddToCart}
          disabled={defaultVariant?.status === 'out_of_stock'}
          className="w-10 h-10 rounded-full bg-brand-surface flex items-center justify-center text-brand-primary hover:bg-brand-accent hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Ajouter au panier"
        >
          <ShoppingCart size={20} />
        </button>
      </div>
    </Link>
  )
}
