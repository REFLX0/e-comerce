"use client";

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
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
  const barRef = useRef<HTMLDivElement>(null)

  // Portal straight to document.body — this component renders inside
  // app/[locale]/template.tsx's page-transition motion.div, whose `transform`
  // (left permanently on the element by Framer Motion after the entry
  // animation settles) redefines the containing block for `position: fixed`
  // descendants, making this bar scroll with page content instead of staying
  // pinned to the viewport bottom. Requires a mounted guard for SSR.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

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

  // Publish this bar's actual rendered height as a CSS var so other fixed
  // elements (the ChatWidget launcher) can offset above it instead of being
  // covered by it — 60px matches this bar's own bottom-[60px] offset (which
  // clears MobileBottomNav), plus a 16px gap.
  useEffect(() => {
    const el = barRef.current
    const updateOffset = () => {
      document.documentElement.style.setProperty(
        '--sticky-cart-offset',
        isVisible && el ? `${el.offsetHeight + 60 + 16}px` : '0px'
      )
    }
    updateOffset()
    window.addEventListener('resize', updateOffset)
    return () => window.removeEventListener('resize', updateOffset)
  }, [isVisible])

  // Don't leave the chat button permanently offset if this component unmounts
  // (e.g. navigating away from the product page) while the bar was visible.
  useEffect(() => {
    return () => {
      document.documentElement.style.setProperty('--sticky-cart-offset', '0px')
    }
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

  if (!mounted) return null

  return createPortal(
    <div
      ref={barRef}
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
    </div>,
    document.body
  )
}