"use client";

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { ShoppingCart, MessageCircle } from 'lucide-react'
import type { Product, ProductVariant } from '@/lib/types'
import { useCartStore } from '@/lib/store/cart.store'
import { PriceDisplay } from '../common/PriceDisplay'
import { gooeyToast as toast } from 'goey-toast'
import { buildProductMessage, buildWhatsAppUrl, isPartsCategory } from '@/lib/whatsapp'

interface Props {
  product: Product
  variant: ProductVariant
}

export function StickyMobileCart({ product, variant }: Props) {
  const t = useTranslations('ProductCard')
  const [isVisible, setIsVisible] = useState(false)
  const { addItem } = useCartStore()

  const isOutOfStock = variant.status === 'out_of_stock'
  const oldPrice = variant.priceTTC * 1.19
  const isPart = isPartsCategory(product.category?.slug)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 600)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleAddToCart = () => {
    if (isOutOfStock) return
    addItem(product, variant, 1)
    if (isPart) {
      // Step 1 — hand the part off to WhatsApp for chassis verification
      window.open(buildWhatsAppUrl(buildProductMessage(product, variant, 1)), '_blank', 'noopener')
      return
    }
    toast.success(t('addedToCart'), { preset: 'bouncy' })
  }

  return (
    <div
      className={`fixed bottom-[60px] left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-xl shadow-overlay transition-transform duration-300 md:bottom-0 lg:hidden ${
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
            oldPriceTTC={oldPrice}
          />
          <p className="mt-0.5 text-[10px] font-medium text-gray-500 italic">{t('shippingNotIncluded')}</p>
        </div>

        {/* CTA */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`flex h-12 shrink-0 items-center gap-2 px-6 shadow-lg rounded-xl font-bold text-white transition-colors ${
            isPart ? 'bg-[#25D366] hover:bg-[#20b858]' : 'btn-primary'
          }`}
        >
          {isPart ? <MessageCircle size={18} /> : <ShoppingCart size={18} />}
          <span className="hidden sm:inline">
            {isOutOfStock ? t('outOfStock') : (isPart ? t('checkViaWhatsApp') : t('addToCart'))}
          </span>
        </button>
      </div>
    </div>
  )
}