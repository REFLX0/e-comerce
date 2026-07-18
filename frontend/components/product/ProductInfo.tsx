"use client";

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import type { Product, ProductVariant } from '@/lib/types'
import { RatingStars } from '../common/RatingStars'
import { StockIndicator } from '../common/StockIndicator'
import { PriceDisplay } from '../common/PriceDisplay'
import { VariantSelector } from './VariantSelector'
import { AddToCartButton } from './AddToCartButton'
import { useVehicleStore } from '@/lib/store/vehicle.store'
import { Check, Share2, Truck, ShieldCheck, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { Link } from '@/i18n/routing'
import { TrustBadges } from '../common/TrustBadges'
import { ShareDropdown } from './ShareDropdown'

interface Props {
  product: Product
  selectedVariant?: ProductVariant
  onVariantChange?: (variant: ProductVariant) => void
}

export function ProductInfo({ product, selectedVariant: controlledVariant, onVariantChange }: Props) {
  const t = useTranslations('Product')
  const [internalVariant, setInternalVariant] = useState(product.variants[0])
  const selectedVariant = controlledVariant ?? internalVariant
  const setSelectedVariant = onVariantChange ?? setInternalVariant
  const { vehicle } = useVehicleStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!selectedVariant) return null

  const oldPrice = selectedVariant.priceTTC * 1.19

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
        <span className="font-mono text-xs text-gray-400">{t('ref')} {selectedVariant.sku}</span>
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
            <p className="text-sm font-bold text-green-900">{t('compatibleVehicle')}</p>
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
          {t('seeReviews')}
        </a>
      </div>

      {/* Price Card */}
      <div className="mb-6 rounded-xl bg-gradient-to-r from-gray-50 to-brand-surface p-5 shadow-sm">
        <PriceDisplay
          priceHT={selectedVariant.priceHT}
          priceTTC={selectedVariant.priceTTC}
          isPromo={product.isPromo}
          promoPercent={product.promoPercent}
          oldPriceTTC={oldPrice}
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
            {t('otherPackaging')}
          </div>
        )}

      {/* Trust & Delivery Badges */}
      <TrustBadges variant="inline" className="mb-6" />

      {/* Add to Cart */}
      <AddToCartButton product={product} variant={selectedVariant} />

      {/* Quick Actions */}
      <div className="border-brand-surface-dark mt-auto flex items-center gap-6 border-t pt-6">
        <ShareDropdown
          productName={product.name}
          productDescription={product.shortDescription || ''}
          className="ml-auto"
        />
      </div>
    </div>
  )
}
