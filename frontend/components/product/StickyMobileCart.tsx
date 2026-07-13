"use client";

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { ShoppingCart } from 'lucide-react'
import type { Product, ProductVariant } from '@/lib/types'
import { useCartStore } from '@/lib/store/cart.store'
import { PriceDisplay } from '../common/PriceDisplay'
import { toast } from 'sonner'

interface Props {
  product: Product
  variant: ProductVariant
}

export function StickyMobileCart({ product, variant }: Props) {
  const t = useTranslations('ProductCard')
  const [isVisible, setIsVisible] = useState(false)
  const { addItem } = useCartStore()

  const isOutOfStock = variant.status === 'out_of_stock'
  const oldPrice = variant.priceHT * 1.2

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past the main Add to Cart button (~600px)
      setIsVisible(window.scrollY > 600)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleAddToCart = () => {
    if (isOutOfStock) return
    addItem(product, variant, 1)
    toast.success('Produit ajouté au panier')
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-xl shadow-overlay transition-transform duration-300 lg:hidden ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="section-padding flex items-center gap-4 py-3">
        {/* Price */}
        <div className="min-w-0 flex-1">
          <p className="text-brand-primary truncate text-sm font-semibold">{product.name}</p>
          <PriceDisplay
            priceHT={variant.priceHT}
            priceTTC={variant.priceTTC}
            isPromo={product.isPromo}
            promoPercent={product.promoPercent}
            oldPriceHT={oldPrice}
          />
        </div>

        {/* CTA */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="btn-primary flex h-12 shrink-0 items-center gap-2 px-6 shadow-lg"
        >
          <ShoppingCart size={18} />
          <span className="hidden sm:inline">
            {isOutOfStock ? t('outOfStock') : t('addToCart')}
          </span>
        </button>
      </div>
    </div>
  )
}
