"use client";

import { useState, useMemo } from 'react'
import type { Product } from '@/lib/types'
import { ProductGallery } from '@/components/product/ProductGallery'
import { ProductInfo } from '@/components/product/ProductInfo'

export function ProductPageClient({ product }: { product: Product }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0])

  const variantImageUrl = useMemo(() => {
    if (selectedVariant?.imageUrl) return selectedVariant.imageUrl
    return null
  }, [selectedVariant])

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
      <div>
        <ProductGallery
          images={product.images}
          productName={product.name}
          variantImageUrl={variantImageUrl}
        />
      </div>
      <div>
        <ProductInfo
          product={product}
          selectedVariant={selectedVariant}
          onVariantChange={setSelectedVariant}
        />
      </div>
    </div>
  )
}
