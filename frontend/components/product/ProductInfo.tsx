"use client";

import { useState, useEffect } from 'react'
import type { Product } from '@/lib/types'
import { RatingStars } from '../common/RatingStars'
import { StockIndicator } from '../common/StockIndicator'
import { PriceDisplay } from '../common/PriceDisplay'
import { VariantSelector } from './VariantSelector'
import { AddToCartButton } from './AddToCartButton'
import { useVehicleStore } from '@/lib/store/vehicle.store'
import { Check, Share2, Truck, ShieldCheck, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { Link } from '@/i18n/routing'

interface Props {
  product: Product
}

export function ProductInfo({ product }: Props) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0])
  const { vehicle } = useVehicleStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

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

      {/* Compatibility Banner */}
      {mounted && vehicle && (
        <div className="mb-6 rounded-xl border-2 border-green-500 bg-green-50 p-4 flex items-center gap-4 animate-fade-in">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500 text-white shadow-sm">
            <Check size={20} strokeWidth={3} />
          </div>
          <div>
            <p className="text-sm font-bold text-green-900">100% Compatible avec votre véhicule</p>
            <p className="text-xs text-green-700 mt-0.5">{vehicle.makeName} {vehicle.modelName} {vehicle.engineCode}</p>
          </div>
        </div>
      )}

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

      {/* Price Card */}
      <div className="mb-6 rounded-xl bg-gradient-to-r from-gray-50 to-brand-surface p-5 shadow-sm">
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
      <div className="mb-6">
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

      {/* Trust & Delivery Badges */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50/60 p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
            <Truck size={16} />
          </div>
          <div>
            <p className="text-xs font-semibold text-green-800">Livraison 24H</p>
            <p className="text-[10px] text-green-600">Gratuite en Tunisie</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <ShieldCheck size={16} />
          </div>
          <div>
            <p className="text-xs font-semibold text-blue-800">100% Authentique</p>
            <p className="text-[10px] text-blue-600">Produit certifié</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50/60 p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <RotateCcw size={16} />
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-800">Retour facile</p>
            <p className="text-[10px] text-amber-600">Sous 14 jours</p>
          </div>
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
