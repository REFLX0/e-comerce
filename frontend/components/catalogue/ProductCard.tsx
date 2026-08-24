"use client";

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { Heart, Check, X, ShoppingCart, AlertTriangle, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Product } from '@/lib/types'
import { useCartStore } from '@/lib/store/cart.store'
import { wishlistApi } from '@/lib/api/wishlist'
import { toast } from 'sonner'
import { formatPrice, formatSKU, formatProductName } from '@/lib/utils/format'
import { useProductCompatibility } from '@/lib/hooks/useProductCompatibility'

/* ── Lazy image with skeleton + error fallback ───────────────────────── */
function CardImage({ src, alt, t }: { src: string; alt: string; t: any }) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-50">
        <span className="px-3 text-center text-[10px] text-gray-400">{t('imageNotAvailable')}</span>
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
        className={`object-contain p-4 transition-transform duration-300 ease-out group-hover:scale-105 ${loading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setLoading(false)}
        onError={() => { setError(true); setLoading(false) }}
      />
    </>
  )
}

/* ── Main card ───────────────────────────────────────────────────────── */
interface Props { 
  product: Product
  viewMode?: 'grid' | 'list'
}

export function ProductCard({ product, viewMode = 'grid' }: Props) {
  const t = useTranslations('ProductCard')
  const { addItem } = useCartStore()
  const { isCompatible, hasCheckedVehicles, vehicleLabel } = useProductCompatibility(product)

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
  
  const hasCompatCheck = 'compatLevel' in product && (product as any).compatLevel === 'check'

  // Compatibility Banner Component
  const CompatibilityStatus = ({ compact = false }: { compact?: boolean }) => {
    if (!hasCheckedVehicles && !hasCompatCheck) return null;

    if (hasCheckedVehicles) {
      if (isCompatible) {
        return (
          <div className="mt-2 flex items-start gap-1.5 rounded bg-green-50 px-2 py-1.5 text-green-700">
            <ShieldCheck size={14} className="mt-0.5 shrink-0" />
            <span className="text-[11px] font-medium leading-tight">
              {compact ? t('compatible') : `Compatible avec votre ${vehicleLabel}`}
            </span>
          </div>
        )
      }
      return (
        <div className="mt-2 flex items-start gap-1.5 rounded bg-red-50 px-2 py-1.5 text-red-600">
          <X size={14} className="mt-0.5 shrink-0" />
          <span className="text-[11px] font-medium leading-tight">
            {compact ? t('incompatible') : `Incompatible avec votre ${vehicleLabel}`}
          </span>
        </div>
      )
    }

    if (hasCompatCheck) {
      return (
        <div className="mt-2 flex items-start gap-1.5 rounded bg-amber-50 px-2 py-1.5 text-amber-700">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span className="text-[11px] font-medium leading-tight">
            {t('compatToVerify')}
          </span>
        </div>
      )
    }
    return null;
  }

  if (viewMode === 'list') {
    return (
      <div className="group relative flex flex-col bg-white border border-gray-200 shadow-sm transition-shadow hover:shadow-md hover:border-brand-primary/30 sm:flex-row sm:items-stretch">
        {/* Image */}
        <div className="relative aspect-square w-full shrink-0 border-b border-gray-100 bg-white sm:w-48 sm:border-b-0 sm:border-r">
          <Link href={`/produit/${product.slug}`} className="absolute inset-0 z-0">
            {product.images?.[0] ? (
              <CardImage src={product.images[0]} alt={product.name} t={t} />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-50">
                <span className="text-[10px] text-gray-300">{t('imageNotAvailable')}</span>
              </div>
            )}
          </Link>
          
          {/* Top-right: Wishlist (Mobile absolute, Desktop hidden as we'll put it in actions) */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm border border-gray-200 sm:hidden"
            onClick={handleAddToWishlist}
            aria-label={t('addToWishlist')}
          >
            <Heart size={14} />
          </motion.button>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <div className="flex items-center gap-2">
            {product.brand && (
              <span className="text-[11px] font-black uppercase tracking-wider text-[#16254c]/70">
                {product.brand.name}
              </span>
            )}
            <span className="text-[11px] font-medium text-gray-400">•</span>
            <span className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
              Réf: {formatSKU(defaultVariant?.sku)}
            </span>
          </div>

          <Link href={`/produit/${product.slug}`} className="mt-1 focus:outline-none">
            <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#16254c] transition-colors sm:text-base">
              {formatProductName(product.name, product.brand?.name)}
            </h3>
          </Link>

          <CompatibilityStatus />

          {/* OEM Approvals */}
          {product.specs?.oemApprovals && product.specs.oemApprovals.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {product.specs.oemApprovals.slice(0, 3).map((approval) => (
                <span
                  key={approval}
                  className="rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700"
                >
                  {approval}
                </span>
              ))}
              {product.specs.oemApprovals.length > 3 && (
                <span className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500">
                  +{product.specs.oemApprovals.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Quick Specs */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {defaultVariant?.volume && (
              <span className="rounded bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                {defaultVariant.volume}
              </span>
            )}
            {product.specs?.viscosity && (
              <span className="rounded bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                {product.specs.viscosity}
              </span>
            )}
          </div>
        </div>

        {/* Actions Sidebar (List View) */}
        <div className="flex w-full shrink-0 flex-col justify-between border-t border-gray-100 bg-gray-50/50 p-4 sm:w-[220px] sm:border-l sm:border-t-0 sm:p-5">
          <div>
            {/* Stock indicator */}
            <div className="mb-3">
              {!isOutOfStock ? (
                <span className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                  <Check size={14} strokeWidth={3} /> {t('inStock')}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#E10600]">
                  <X size={14} strokeWidth={3} /> {t('outOfStock')}
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex flex-col">
              {isPriceTbd ? (
                <span className="text-lg font-bold text-[#16254c]">{t('priceNa')}</span>
              ) : defaultVariant ? (
                <>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-[#16254c]">{formatPrice(defaultVariant.priceTTC)}</span>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">TTC</span>
                  </div>
                  {product.isPromo && oldPrice > 0 && (
                    <span className="text-sm text-gray-400 line-through mt-0.5">
                      {formatPrice(oldPrice)}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-sm text-gray-400">{t('priceNa')}</span>
              )}
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="flex min-h-[40px] flex-1 items-center justify-center gap-2 bg-[#E10600] text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-[#bd0500] disabled:cursor-not-allowed disabled:bg-gray-300"
              aria-label={t('addToCart')}
            >
              <ShoppingCart size={15} />
              {t('addToCart')}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToWishlist}
              className="hidden h-10 w-10 shrink-0 items-center justify-center border border-gray-200 bg-white text-gray-400 transition-colors hover:border-[#E10600] hover:text-[#E10600] sm:flex"
              aria-label={t('addToWishlist')}
            >
              <Heart size={16} />
            </motion.button>
          </div>
        </div>
      </div>
    )
  }

  // ── Grid View ─────────────────────────────────────────────────────────
  return (
    <div className="group relative flex h-full flex-col bg-white border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-brand-primary/20">
      
      {/* ── Image zone ─────────────────────────────────────────────── */}
      <div className="relative aspect-square overflow-hidden bg-white border-b border-gray-100">
        
        {/* Top Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {product.isNew && (
            <span className="bg-[#16254c] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
              {t('new')}
            </span>
          )}
          {product.isPromo && (
            <span className="bg-[#E10600] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
              {t('promo')}{product.promoPercent ? ` -${product.promoPercent}%` : ''}
            </span>
          )}
        </div>

        {/* Top-right: Wishlist */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-400 shadow-sm border border-gray-100 backdrop-blur transition-colors hover:text-[#E10600]"
          onClick={handleAddToWishlist}
          aria-label={t('addToWishlist')}
        >
          <Heart size={14} />
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
        
        {/* Brand & SKU */}
        <div className="flex items-center justify-between gap-2">
          {product.brand ? (
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-[#16254c]/70">
              {product.brand.name}
            </span>
          ) : <span />}
          <span className="text-[9px] font-semibold uppercase text-gray-400 tracking-wider">
            Réf: {formatSKU(defaultVariant?.sku)}
          </span>
        </div>

        {/* Product name */}
        <Link href={`/produit/${product.slug}`} className="mt-1 focus:outline-none">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-xs font-bold leading-relaxed text-gray-900 transition-colors group-hover:text-[#16254c] sm:text-[13px]">
            {formatProductName(product.name, product.brand?.name)}
          </h3>
        </Link>

        {/* Compatibility */}
        <div className="mt-1 flex-1">
          <CompatibilityStatus compact />
        </div>

        {/* OEM Approvals */}
        {product.specs?.oemApprovals && product.specs.oemApprovals.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {product.specs.oemApprovals.slice(0, 2).map((approval) => (
              <span
                key={approval}
                className="rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold text-blue-700 leading-tight"
              >
                {approval}
              </span>
            ))}
            {product.specs.oemApprovals.length > 2 && (
              <span className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[9px] font-semibold text-gray-500 leading-tight">
                +{product.specs.oemApprovals.length - 2}
              </span>
            )}
          </div>
        )}

        <div className="mt-3 flex items-end justify-between border-t border-gray-100 pt-3">
          {/* Price */}
          <div className="flex flex-col">
            <span className="mb-0.5 flex items-center gap-1 text-[10px] font-bold">
              {!isOutOfStock ? (
                <span className="text-green-600">{t('inStock')}</span>
              ) : (
                <span className="text-[#E10600]">{t('outOfStock')}</span>
              )}
            </span>
            
            {isPriceTbd ? (
              <span className="text-sm font-bold text-[#16254c]">{t('priceNa')}</span>
            ) : defaultVariant ? (
              <div className="flex items-baseline gap-1">
                <span className="text-base font-black text-[#16254c] sm:text-lg">
                  {formatPrice(defaultVariant.priceTTC)}
                </span>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">TTC</span>
              </div>
            ) : (
              <span className="text-sm text-gray-400">{t('priceNa')}</span>
            )}
          </div>

          {/* Quick Add Button (Icon only to save space) */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#E10600] text-white transition-colors hover:bg-[#bd0500] disabled:cursor-not-allowed disabled:bg-gray-300 sm:h-10 sm:w-10"
            aria-label={t('addToCart')}
          >
            <ShoppingCart size={16} />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
