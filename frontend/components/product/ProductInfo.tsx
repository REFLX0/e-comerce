"use client";

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { Product, ProductVariant } from '@/lib/types'
import { RatingStars } from '../common/RatingStars'
import { StockIndicator } from '../common/StockIndicator'
import { PriceDisplay } from '../common/PriceDisplay'
import { VariantSelector } from './VariantSelector'
import { AddToCartButton } from './AddToCartButton'
import { Check } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { TrustBadges } from '../common/TrustBadges'
import { ShareDropdown } from './ShareDropdown'
import { useProductCompatibility } from '@/lib/hooks/useProductCompatibility'
import { formatSKU } from '@/lib/utils/format'

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
  const { isCompatible, vehicleLabel, hasCheckedVehicles } = useProductCompatibility(product)

  if (!selectedVariant) return null

  const oldPrice = selectedVariant.priceTTC * 1.19

  return (
    <div className="flex h-full flex-col">
      {/* Brand & Reference */}
      <div className="mb-1.5 flex items-center justify-between">
        {product.brand && (
          <Link
            href={`/marque/${product.brand.slug}`}
            className="text-brand-muted text-xs font-semibold tracking-wider uppercase hover:underline"
          >
            {product.brand.name}
          </Link>
        )}
        <span className="font-mono text-xs text-gray-400">{t('ref')} {formatSKU(selectedVariant.sku)}</span>
      </div>

      {/* Title */}
      <h1 className="font-display text-brand-primary mb-1 text-lg leading-tight font-bold">
        {product.name}
      </h1>

      {/* Compatibility Banner */}
      {hasCheckedVehicles && isCompatible && vehicleLabel && (
        <div className="mb-1.5 rounded-xl border-2 border-green-500 bg-green-50 p-2 flex items-center gap-2 animate-fade-in">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-500 text-white shadow-sm">
            <Check size={14} strokeWidth={3} />
          </div>
          <div>
            <p className="text-xs font-bold text-green-900">{t('compatibleVehicle')}</p>
            <p className="text-[11px] text-green-700 mt-0.5">{vehicleLabel}</p>
          </div>
        </div>
      )}

      {/* Rating & Reviews Link */}
      <div className="border-brand-surface-dark mb-1.5 flex items-center gap-3 border-b pb-1.5">
        <RatingStars rating={product.rating} count={product.reviewCount} size={14} />
        <a
          href="#avis"
          className="text-brand-primary hover:text-brand-primary/70 text-xs underline-offset-4 transition-colors hover:underline"
        >
          {t('seeReviews')}
        </a>
      </div>

      {/* Price Card */}
      <div className="mb-1.5 rounded-xl bg-gradient-to-r from-gray-50 to-brand-surface p-2 shadow-sm">
        <PriceDisplay
          priceHT={selectedVariant.priceHT}
          priceTTC={selectedVariant.priceTTC}
          isPromo={product.isPromo}
          promoPercent={product.promoPercent}
          oldPriceTTC={oldPrice}
          className="origin-left scale-100"
        />
        <p className="mt-0.5 text-[10px] font-medium text-gray-500 italic">+ Frais de livraison (non inclus)</p>
      </div>

      {/* Stock */}
      <div className="mb-2">
        <StockIndicator status={selectedVariant.status} />
      </div>

      {/* Short Description */}
      {product.shortDescription && (
        <p className="mb-2 text-sm leading-relaxed text-gray-600 line-clamp-2">{product.shortDescription}</p>
      )}

      {/* Variant Selector */}
      <VariantSelector
        variants={product.variants}
        selectedVariant={selectedVariant}
        onChange={setSelectedVariant}
      />

      {/* Out of Stock Warning */}
      {selectedVariant.status === 'out_of_stock' &&
        product.variants.some((v: any) => v.status === 'in_stock') && (
          <div className="mb-3 rounded-xl border border-orange-200 bg-orange-50 p-3 text-xs font-medium text-orange-800">
            {t('otherPackaging')}
          </div>
        )}

      {/* Add to Cart */}
      <AddToCartButton product={product} variant={selectedVariant} />

      {/* Reassurance */}
      <TrustBadges variant="compact" className="mb-2" />

      {/* Quick Actions */}
      <div className="border-brand-surface-dark flex items-center gap-4 border-t pt-3">
        <ShareDropdown
          productName={product.name}
          productDescription={product.shortDescription || ''}
          className="ml-auto"
        />
      </div>
    </div>
  )
}
