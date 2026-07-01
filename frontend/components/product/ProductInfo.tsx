"use client";

import { useState } from 'react'
import type { Product } from '@/lib/types'
import { RatingStars } from '../common/RatingStars'
import { StockIndicator } from '../common/StockIndicator'
import { PriceDisplay } from '../common/PriceDisplay'
import { VariantSelector } from './VariantSelector'
import { AddToCartButton } from './AddToCartButton'
import { Share2, Truck } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface Props {
  product: Product
}

export function ProductInfo({ product }: Props) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0])

  if (!selectedVariant) return null

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: product.name,
          text: product.shortDescription,
          url: window.location.href,
        })
        .catch(console.error)
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Lien copié dans le presse-papier')
    }
  }

  const oldPrice = selectedVariant.priceHT * 1.2

  return (
    <div className="flex h-full flex-col">
      {/* Brand & Reference */}
      <div className="mb-4 flex items-center justify-between">
        {product.brand && (
          <Link
            href={`/marque/${product.brand.slug}`}
            className="text-brand-accent text-sm font-semibold tracking-wider uppercase hover:underline"
          >
            {product.brand.name}
          </Link>
        )}
        <span className="font-mono text-xs text-gray-400">Réf: {selectedVariant.sku}</span>
      </div>

      {/* Title */}
      <h1 className="font-display text-brand-primary mb-4 text-3xl leading-tight font-bold md:text-4xl">
        {product.name}
      </h1>

      {/* Rating & Reviews Link */}
      <div className="border-brand-surface-dark mb-6 flex items-center gap-4 border-b pb-6">
        <RatingStars rating={product.rating} count={product.reviewCount} size={20} />
        <a
          href="#avis"
          className="text-brand-primary hover:text-brand-accent text-sm underline-offset-4 transition-colors hover:underline"
        >
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
          className="origin-left scale-125"
        />
      </div>

      {/* Stock */}
      <div className="mb-8">
        <StockIndicator status={selectedVariant.status} stock={selectedVariant.stock} />
      </div>

      {/* Short Description */}
      {product.shortDescription && (
        <p className="mb-8 leading-relaxed text-gray-600">{product.shortDescription}</p>
      )}

      {/* Variant Selector */}
      <VariantSelector
        variants={product.variants}
        selectedVariant={selectedVariant}
        onChange={setSelectedVariant}
      />

      {/* Out of Stock Warning for current variant if others are available */}
      {selectedVariant.status === 'out_of_stock' &&
        product.variants.some((v: any) => v.status === 'in_stock') && (
          <div className="mb-6 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm font-medium text-orange-800">
            Produit disponible avec d'autres emballages.
          </div>
        )}

      {/* Delivery Banner */}
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 p-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
          <Truck size={16} />
        </div>
        <div>
          <p className="text-sm font-semibold text-green-800">Livraison Gratuite 24H</p>
          <p className="text-xs text-green-600">Sur tout le territoire tunisien</p>
        </div>
      </div>

      {/* Add to Cart */}
      <AddToCartButton product={product} variant={selectedVariant} />

      {/* Quick Actions */}
      <div className="border-brand-surface-dark mt-auto flex items-center gap-6 border-t pt-6">
        <button
          onClick={handleShare}
          className="hover:text-brand-primary ml-auto flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors"
        >
          <Share2 size={20} />
          Partager
        </button>
      </div>
    </div>
  )
}
