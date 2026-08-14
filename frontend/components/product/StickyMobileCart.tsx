"use client";

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { ShoppingCart, MessageCircle } from 'lucide-react'
import type { Product, ProductVariant } from '@/lib/types'
import { useCartStore } from '@/lib/store/cart.store'
import { PriceDisplay } from '../common/PriceDisplay'
import { toast } from 'sonner'

interface Props {
  product: Product
  variant: ProductVariant
}

const SENSITIVE_CATEGORIES = [
  'huiles-moteur', 'frein', 'direction-assistee', 'transmission',
  'refroidissement', 'adblue', 'additif-essence', 'additif-diesel',
  'additif-huile', 'filtres'
]

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+21655555555'

export function StickyMobileCart({ product, variant }: Props) {
  const t = useTranslations('ProductCard')
  const [isVisible, setIsVisible] = useState(false)
  const { addItem } = useCartStore()

  const isOutOfStock = variant.status === 'out_of_stock'
  const oldPrice = variant.priceTTC * 1.19
  const isSensitive = product.category?.slug && SENSITIVE_CATEGORIES.includes(product.category.slug)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 600)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleAddToCart = () => {
    if (isOutOfStock) return
    if (isSensitive) {
      const text = `Bonjour, je suis intéressé par la pièce "${product.name}" (Réf: ${variant.sku || product.slug}).\n\nVeuillez vérifier la disponibilité et la correspondance de cette pièce avec mon véhicule.\n\n[Insérez votre numéro de châssis / carte grise ici]`
      const url = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`
      window.open(url, '_blank')
      return
    }
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
            oldPriceTTC={oldPrice}
          />
        </div>

        {/* CTA */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`flex h-12 shrink-0 items-center gap-2 px-6 shadow-lg rounded-xl font-bold text-white transition-colors ${isSensitive ? 'bg-[#25D366] hover:bg-[#20b858]' : 'btn-primary'}`}
        >
          {isSensitive ? <MessageCircle size={18} /> : <ShoppingCart size={18} />}
          <span className="hidden sm:inline">
            {isOutOfStock ? t('outOfStock') : (isSensitive ? 'Vérifier via WhatsApp' : t('addToCart'))}
          </span>
        </button>
      </div>
    </div>
  )
}
