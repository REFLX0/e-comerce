"use client";

import { useState, useMemo } from 'react'
import type { Product, ProductVariant } from '@/lib/types'
import { ProductGallery } from '@/components/product/ProductGallery'
import { ProductInfo } from '@/components/product/ProductInfo'

export function ProductPageClient({ product }: { product: Product }) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(product.variants?.[0])
  const [isVariantManuallySelected, setIsVariantManuallySelected] = useState(false)

  const variantImageUrl = useMemo(() => {
    if (selectedVariant?.imageUrl) return selectedVariant.imageUrl
    return null
  }, [selectedVariant])

  const handleVariantChange = (variant: ProductVariant) => {
    setSelectedVariant(variant)
    setIsVariantManuallySelected(true)
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
      <div>
        <ProductGallery
          images={product.images}
          productName={product.name}
          variantImageUrl={variantImageUrl}
          variants={product.variants}
          isVariantManuallySelected={isVariantManuallySelected}
        />
      </div>
      <div>
        <ProductInfo
          product={product}
          selectedVariant={selectedVariant}
          onVariantChange={handleVariantChange}
        />
      </div>
    </div>
  )
}
