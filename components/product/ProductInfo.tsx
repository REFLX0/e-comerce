'use client'

import { useState } from 'react'
import type { Product } from '@/lib/types'
import { RatingStars } from '../common/RatingStars'
import { StockIndicator } from '../common/StockIndicator'
import { PriceDisplay } from '../common/PriceDisplay'
import { VariantSelector } from './VariantSelector'
import { AddToCartButton } from './AddToCartButton'
import { Heart, Scale, Share2 } from 'lucide-react'
import { useWishlistStore } from '@/lib/store/wishlist.store'
import { useComparatorStore } from '@/lib/store/comparator.store'
import { toast } from 'sonner'
import Link from 'next/link'

interface Props {
  product: Product
}

export function ProductInfo({ product }: Props) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0])
  const { items: wishlistItems, toggle: toggleWishlist } = useWishlistStore()
  const { items: compareItems, toggle: toggleCompare } = useComparatorStore()

  if (!selectedVariant) return null

  const isFavorite = wishlistItems.some((p) => p.id === product.id)
  const isCompared = compareItems.some((p) => p.id === product.id)

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.shortDescription,
        url: window.location.href,
      }).catch(console.error)
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Lien copié dans le presse-papier')
    }
  }

  const oldPrice = selectedVariant.priceHT * 1.2

  return (
    <div className="flex flex-col h-full">
      {/* Brand & Reference */}
      <div className="flex items-center justify-between mb-4">
        {product.brand && (
          <Link href={`/marque/${product.brand.slug}`} className="text-sm font-semibold uppercase text-brand-accent tracking-wider hover:underline">
            {product.brand.name}
          </Link>
        )}
        <span className="text-xs text-gray-400 font-mono">
          Réf: {selectedVariant.sku}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-display font-bold text-brand-primary mb-4 leading-tight">
        {product.name}
      </h1>

      {/* Rating & Reviews Link */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-brand-surface-dark">
        <RatingStars rating={product.rating} count={product.reviewCount} size={20} />
        <a href="#avis" className="text-sm text-brand-primary hover:text-brand-accent transition-colors underline-offset-4 hover:underline">
          Voir les avis
        </a>
      </div>

      {/* Price */}
      <div className="mb-6">
        <PriceDisplay
          priceHT={selectedVariant.priceHT}
          priceTTC={selectedVariant.priceTTC}
          isPromo={product.isPromo}
          promoPercent={product.promoPercent}
          oldPriceHT={oldPrice}
          className="scale-125 origin-left"
        />
      </div>

      {/* Stock */}
      <div className="mb-8">
        <StockIndicator status={selectedVariant.status} stock={selectedVariant.stock} />
      </div>

      {/* Short Description */}
      {product.shortDescription && (
        <p className="text-gray-600 mb-8 leading-relaxed">
          {product.shortDescription}
        </p>
      )}

      {/* Variant Selector */}
      <VariantSelector
        variants={product.variants}
        selectedVariant={selectedVariant}
        onChange={setSelectedVariant}
      />

      {/* Add to Cart */}
      <AddToCartButton product={product} variant={selectedVariant} />

      {/* Quick Actions */}
      <div className="flex items-center gap-6 border-t border-brand-surface-dark pt-6 mt-auto">
        <button
          onClick={() => toggleWishlist(product)}
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${isFavorite ? 'text-red-500' : 'text-gray-500 hover:text-brand-primary'}`}
        >
          <Heart size={20} className={isFavorite ? 'fill-red-500' : ''} />
          {isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        </button>
        <button
          onClick={() => toggleCompare(product)}
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${isCompared ? 'text-brand-primary' : 'text-gray-500 hover:text-brand-primary'}`}
        >
          <Scale size={20} />
          Comparer
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-primary transition-colors ml-auto"
        >
          <Share2 size={20} />
          Partager
        </button>
      </div>
    </div>
  )
}
