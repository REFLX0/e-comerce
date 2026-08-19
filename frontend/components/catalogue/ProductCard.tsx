"use client";

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { Heart, Check, X, ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Product } from '@/lib/types'
import { useCartStore } from '@/lib/store/cart.store'
import { wishlistApi } from '@/lib/api/wishlist'
import { RatingStars } from '../common/RatingStars'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/utils/format'
import { useProductCompatibility } from '@/lib/hooks/useProductCompatibility'

/* ── Lazy image with skeleton + error fallback ───────────────────────── */
function CardImage({ src, alt, t }: { src: string; alt: string; t: any }) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-50">
        <span className="text-[10px] text-gray-300 text-center px-3">{t('imageNotAvailable')}</span>
      </div>
    )
  }

  return (
    <>
      {loading && <div className="absolute inset-0 animate-pulse bg-gray-100" />}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className={`object-contain p-3 transition-transform duration-300 ease-out group-hover:scale-[1.04] ${loading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setLoading(false)}
        onError={() => { setError(true); setLoading(false) }}
      />
    </>
  )
}

/* ── Main card ───────────────────────────────────────────────────────── */
interface Props { product: Product }

export function ProductCard({ product }: Props) {
  const t = useTranslations('ProductCard')
  const { addItem } = useCartStore()
  const { isCompatible, hasCheckedVehicles } = useProductCompatibility(product)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    const variant = product.variants?.[0]
    if (!variant) return
    const result = addItem(product, variant, 1)
    if (!result.ok) { toast.error(t('outOfStock')); return }
    if (result.capped) toast.warning(t('stockLimit'))
    else toast.success(t('addedToCart'))
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
  const isOutOfStock = defaultVariant?.status === 'out_of_stock'
  const isPriceTbd = defaultVariant?.sku.includes('-PRICE-TBD-')
  const oldPrice =
    product.isPromo &&
    product.promoPercent &&
    product.promoPercent > 0 &&
    product.promoPercent < 100 &&
    defaultVariant
      ? defaultVariant.priceTTC / (1 - product.promoPercent / 100)
      : 0

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow duration-300 hover:border-brand-primary/20 hover:shadow-lg"
    >
      {/* ── Image zone ─────────────────────────────────────────────── */}
      <div className="relative aspect-square overflow-hidden bg-white">

        {/* Top-left badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5 items-start">
          {product.isNew && (
            <span className="rounded bg-brand-primary px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-sm">
              {t('new')}
            </span>
          )}
          {product.isPromo && (
            <span className="rounded bg-brand-accent px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-brand-primary-dark shadow-sm">
              {t('promo')}{product.promoPercent ? ` -${product.promoPercent}%` : ''}
            </span>
          )}
          {hasCheckedVehicles && isCompatible && (
            <span className="flex items-center gap-1 rounded bg-green-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-sm">
              <Check size={8} strokeWidth={3} /> {t('compatible')}
            </span>
          )}
          {hasCheckedVehicles && !isCompatible && (
            <span className="flex items-center gap-1 rounded bg-red-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-sm">
              <X size={8} strokeWidth={3} /> {t('incompatible')}
            </span>
          )}
          {'compatLevel' in product && (product as { compatLevel?: string }).compatLevel === 'check' && (
            <span className="flex items-center gap-1 rounded bg-amber-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-sm">
              ⚠ {t('compatToVerify')}
            </span>
          )}
        </div>

        {/* Top-right: Wishlist */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          className="absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-400 shadow-sm backdrop-blur transition-all duration-200 hover:border-red-200 hover:bg-white hover:text-red-400"
          onClick={handleAddToWishlist}
          aria-label={t('addToWishlist')}
        >
          <Heart size={15} />
        </motion.button>

        {/* Clickable image */}
        <Link href={`/produit/${product.slug}`} className="absolute inset-0 z-0">
          {product.images?.[0] ? (
            <CardImage src={product.images[0]} alt={product.name} t={t} />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-50">
              <span className="text-[10px] text-gray-300">{t('imageNotAvailable')}</span>
            </div>
          )}
        </Link>
      </div>

      {/* ── Content zone ───────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-3.5">

        {/* Brand */}
        {product.brand && (
          <span className="text-[10px] font-black uppercase tracking-[0.12em] text-brand-primary/70">
            {product.brand.name}
          </span>
        )}

        {/* Product name */}
        <Link href={`/produit/${product.slug}`} className="mt-0.5 focus:outline-none">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-[13px] font-bold leading-snug text-gray-800 transition-colors duration-150 group-hover:text-brand-primary">
            {product.name}
          </h3>
        </Link>

        {/* Stars + review count */}
        <div className="mt-1.5 flex items-center gap-1">
          <RatingStars rating={product.rating} count={product.reviewCount} size={13} />
          <span className="text-[11px] text-gray-400">({product.reviewCount})</span>
        </div>

        {/* Spec tags: volume + viscosity */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {defaultVariant?.volume && (
            <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
              {defaultVariant.volume}
            </span>
          )}
          {product.specs?.viscosity && (
            <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
              {product.specs.viscosity}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="mt-3 border-t border-gray-100 pt-3">
          {isPriceTbd ? (
            <span className="text-sm font-semibold text-brand-primary">{t('priceNa')}</span>
          ) : defaultVariant ? (
            <div className="flex flex-wrap items-baseline gap-1.5">
              <span className="text-base font-black text-brand-primary">
                {formatPrice(defaultVariant.priceTTC)}
              </span>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">TTC</span>
              {product.isPromo && oldPrice > 0 && (
                <span className="text-[11px] text-gray-400 line-through">
                  {formatPrice(oldPrice)}
                </span>
              )}
            </div>
          ) : (
            <span className="text-sm text-gray-400">{t('priceNa')}</span>
          )}

          {/* Stock indicator */}
          <div className="mt-1.5">
            {!isOutOfStock ? (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-green-600">
                <Check size={11} strokeWidth={3} /> {t('inStock')}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-red-500">
                <X size={11} /> {t('outOfStock')}
              </span>
            )}
          </div>
        </div>

        {/* CTA row — full-width "ADD TO CART" + small cart icon */}
        <div className="mt-3 flex gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex min-h-[44px] flex-1 items-center justify-center rounded-lg bg-brand-primary text-[11px] font-black uppercase tracking-widest text-white transition-all duration-200 hover:bg-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t('addToCart')}
          >
            {t('addToCart')}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 border-brand-primary/20 bg-white text-brand-primary transition-all duration-200 hover:border-brand-primary hover:bg-brand-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t('addToCart')}
          >
            <ShoppingCart size={17} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
