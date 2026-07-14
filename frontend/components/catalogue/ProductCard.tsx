"use client";

import { useSyncExternalStore } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { Heart, Check, X } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Product } from '@/lib/types'
import { useCartStore } from '@/lib/store/cart.store'
import { useVehicleStore } from '@/lib/store/vehicle.store'
import { wishlistApi } from '@/lib/api/wishlist'
import { PriceDisplay } from '../common/PriceDisplay'
import { RatingStars } from '../common/RatingStars'
import { toast } from 'sonner'

interface Props {
  product: Product
}

export function ProductCard({ product }: Props) {
  const t = useTranslations('ProductCard')
  const { addItem } = useCartStore()
  const { vehicle } = useVehicleStore()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    const variant = product.variants?.[0]
    if (!variant) return
    const result = addItem(product, variant, 1)
    if (!result.ok) {
      toast.error(t('outOfStock'))
      return
    }
    if (result.capped) {
      toast.warning(t('stockLimit'))
    } else {
      toast.success(t('addedToCart'))
    }
  }

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      await wishlistApi.toggle(product.id)
      toast.success(t('addedToWishlist'))
    } catch {
      toast.error(t('wishlistError'))
    }
  }

  const defaultVariant = product.variants?.[0]
  // Only show a crossed-out price when there is a REAL promo — never fabricate one
  const oldPrice =
    product.isPromo &&
    product.promoPercent &&
    product.promoPercent > 0 &&
    product.promoPercent < 100 &&
    defaultVariant
      ? defaultVariant.priceHT / (1 - product.promoPercent / 100)
      : 0

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow duration-300 hover:border-brand-accent/30 hover:shadow-lg"
    >
      {/* Image with Badges */}
      <div className="relative aspect-square overflow-hidden bg-white p-2">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 items-start">
          {product.isPromo && (
            <span className="rounded-md bg-brand-accent px-2.5 py-1 text-[10px] font-bold tracking-normal text-white uppercase shadow-sm">
              {t('promo')} {product.promoPercent ? `-${product.promoPercent}%` : ''}
            </span>
          )}
          {product.isNew && (
            <span className="rounded-md bg-sky-100 px-2.5 py-1 text-[10px] font-bold tracking-normal text-brand-primary uppercase shadow-sm">
              {t('new')}
            </span>
          )}
          {mounted && vehicle && (
            <span className="flex items-center gap-1 rounded-md border border-green-400 bg-green-500 px-2.5 py-1 text-[10px] font-bold tracking-normal text-white uppercase shadow-sm">
              <Check size={10} strokeWidth={3} /> {t('compatible')}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="absolute top-3 right-3 z-10 flex h-10 w-10 translate-y-0 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-400 opacity-100 shadow-sm backdrop-blur transition-all duration-200 hover:bg-white hover:text-brand-accent hover:border-brand-accent/20 sm:-translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
          onClick={handleAddToWishlist}
          aria-label={t('addToWishlist')}
        >
          <Heart size={18} />
        </motion.button>

         <Link href={`/produit/${product.slug}`} className="absolute inset-0 z-0">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-2 transition-transform duration-200 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-50">
              <span className="text-xs text-gray-400">{t('imageNotAvailable')}</span>
            </div>
          )}
        </Link>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Brand & Title */}
        <Link href={`/produit/${product.slug}`} className="flex flex-col gap-1 focus:outline-none">
          {product.brand && (
            <span className="text-xs font-black tracking-wider text-brand-primary uppercase">
              {product.brand.name}
            </span>
          )}
          <h3 className="line-clamp-2 min-h-10 text-sm leading-snug font-bold text-gray-800 transition-colors duration-200 group-hover:text-brand-accent">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <RatingStars rating={product.rating} count={product.reviewCount} />
          {product.reviewCount > 0 && <span className="text-xs text-gray-500">({product.reviewCount})</span>}
        </div>

        {/* Specs Preview */}
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-medium text-gray-500">
          {defaultVariant?.volume && (
            <span className="rounded-md bg-gray-100 px-1.5 py-0.5">{defaultVariant.volume}</span>
          )}
          {product.specs?.viscosity && (
            <span className="rounded-md bg-gray-100 px-1.5 py-0.5">{product.specs.viscosity}</span>
          )}
          {product.specs?.approvals?.[0] && (
            <span className="max-w-[100px] truncate rounded-md bg-gray-100 px-1.5 py-0.5" title={product.specs.approvals[0]}>
              {product.specs.approvals[0]}
            </span>
          )}
        </div>

        {/* Price & Stock */}
        <div className="mt-2 flex items-end justify-between border-t border-gray-100 pt-3">
          <div>
            {defaultVariant ? (
              <PriceDisplay
                priceHT={defaultVariant.priceHT}
                priceTTC={defaultVariant.priceTTC}
                isPromo={product.isPromo}
                promoPercent={product.promoPercent}
                oldPriceHT={oldPrice}
              />
            ) : (
              <span className="text-sm text-gray-500">{t('priceNa')}</span>
            )}
            
            <div className="mt-1 flex items-center gap-1 text-[11px] font-medium">
              {defaultVariant?.status !== 'out_of_stock' ? (
                <span className="flex items-center gap-1 text-green-600"><Check size={12} /> {t('inStock')}</span>
              ) : (
                <span className="flex items-center gap-1 text-red-500"><X size={12} /> {t('outOfStock')}</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-auto pt-3 flex gap-2">
          {/* Add to Cart Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleAddToCart}
            disabled={defaultVariant?.status === 'out_of_stock'}
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded bg-brand-primary py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 hover:bg-brand-accent disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t('addToCart')}
          >
            {t('addToCart')}
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="flex h-11 w-11 items-center justify-center rounded border border-gray-200 bg-gray-50 text-gray-400 transition-all duration-200 hover:border-brand-accent hover:text-brand-accent focus:outline-none"
            onClick={handleAddToWishlist}
            aria-label={t('addToWishlist')}
          >
            <Heart size={18} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
