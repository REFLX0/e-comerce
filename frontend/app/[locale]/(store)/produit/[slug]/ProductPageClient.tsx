"use client";

import { useState, useMemo } from 'react'
import type { Product, ProductVariant } from '@/lib/types'
import { ProductGallery } from '@/components/product/ProductGallery'
import { ProductInfo } from '@/components/product/ProductInfo'
import { parseVolumeToL } from '@/lib/utils/format'

export function ProductPageClient({ product }: { product: Product }) {
  // 1. Sort variants ascending by volume (250ml -> 500ml -> 1L -> 4L -> 5L -> 20L...)
  const sortedVariants = useMemo(() => {
    const raw = product.variants || []
    if (raw.length <= 1) return raw
    return [...raw].sort((a, b) => {
      const volA = parseVolumeToL(a.volume)
      const volB = parseVolumeToL(b.volume)
      if (volA !== null && volB !== null) return volA - volB
      if (volA !== null) return -1
      if (volB !== null) return 1
      return 0
    })
  }, [product.variants])

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(sortedVariants[0])
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
          variants={sortedVariants}
          isVariantManuallySelected={isVariantManuallySelected}
          onVariantChange={handleVariantChange}
        />
      </div>
      <div>
        <ProductInfo
          product={product}
          variants={sortedVariants}
          selectedVariant={selectedVariant}
          onVariantChange={handleVariantChange}
        />
      </div>
    </div>
  )
}

