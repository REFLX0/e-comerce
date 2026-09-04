"use client";

import { useState, useMemo, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { Heart, Check, X, ShoppingCart, AlertTriangle, ShieldCheck, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Product, ProductVariant } from '@/lib/types'
import { useCartStore } from '@/lib/store/cart.store'
import { wishlistApi } from '@/lib/api/wishlist'
import { gooeyToast as toast } from 'goey-toast'
import { formatPrice, formatSKU, formatProductName, parseVolumeToL, matchVolumeImage } from '@/lib/utils/format'
import { useProductCompatibility } from '@/lib/hooks/useProductCompatibility'

/* ── Lazy image with skeleton + branded automotive fallback ───────── */
function CardImage({
  src,
  alt,
  brand,
  sku,
  t,
}: {
  src?: string | null
  alt: string
  brand?: string
  sku?: string
  t: any
}) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(Boolean(src))

  if (!src || error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100/90 p-4 text-center select-none transition-colors group-hover:from-slate-100 group-hover:to-slate-200/90">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-200/80 mb-2 transition-transform duration-200 group-hover:scale-105">
          <svg className="h-7 w-7 text-[#16254c]/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>
        {brand && (
          <span className="text-[11px] font-black text-[#16254c] tracking-wider uppercase truncate max-w-[140px]">{brand}</span>
        )}
        {sku && (
          <span className="text-[10px] font-mono text-slate-400 mt-0.5 max-w-[130px] truncate">{sku}</span>
        )}
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      {loading && <div className="absolute inset-0 animate-pulse bg-gray-100" />}
      <AnimatePresence mode="wait">
        <motion.div
          key={src}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-contain p-4 transition-transform duration-300 ease-out group-hover:scale-105 ${loading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setLoading(false)}
            onError={() => { setError(true); setLoading(false) }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
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

  // 1. Detect size/volume variants with images and sort ascending (250ml -> 500ml -> 1L -> 4L -> 5L -> 20L...)
  const sortedVariants = useMemo(() => {
    const raw = product.variants || []
    if (raw.length === 0) return []

    // Filter variants that have a parseable volume, sort ascending (250ml -> 500ml -> 1L -> 4L -> 5L -> 20L...)
    const withVolumes = raw
      .filter((v) => !!v.volume && parseVolumeToL(v.volume) !== null)
      .sort((a, b) => (parseVolumeToL(a.volume) ?? 0) - (parseVolumeToL(b.volume) ?? 0))

    if (withVolumes.length > 0) {
      // De-duplicate any duplicate volumes and resolve volume-matching image
      const seen = new Set<string>()
      const deduped: ProductVariant[] = []
      for (const v of withVolumes) {
        const normVol = (v.volume || '').trim().toLowerCase()
        if (!seen.has(normVol)) {
          seen.add(normVol)
          const resolvedImg = v.imageUrl || matchVolumeImage(product.images, v.volume) || undefined
          deduped.push(resolvedImg && resolvedImg !== v.imageUrl ? { ...v, imageUrl: resolvedImg } : v)
        }
      }
      return deduped
    }

    return raw
  }, [product.variants, product.images])

  // Variants eligible for image carousel (must have an imageUrl and strictly unique image URLs)
  const carouselVariants = useMemo(() => {
    const seen = new Set<string>()
    const list: ProductVariant[] = []
    for (const v of sortedVariants) {
      const img = v.imageUrl || matchVolumeImage(product.images, v.volume)
      if (!img) continue
      const key = img.trim().toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        list.push({ ...v, imageUrl: img })
      }
    }
    return list
  }, [sortedVariants, product.images])

  // All display images for sliding: either from variants or from all distinct product images
  const carouselImages = useMemo(() => {
    if (carouselVariants.length > 1) {
      return carouselVariants.map((v) => v.imageUrl as string)
    }
    // For products without multiple volume variants (filters, parts, etc.), use all distinct product images
    const seen = new Set<string>()
    const list: string[] = []
    for (const img of product.images || []) {
      if (!img) continue
      const key = img.trim().toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        list.push(img)
      }
    }
    return list
  }, [carouselVariants, product.images])

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [isManuallySelected, setIsManuallySelected] = useState(false)
  const [carouselIndex, setCarouselIndex] = useState(0)

  // Autoplay loop when ANY product has multiple images (variants or photos) and user hasn't manually selected
  useEffect(() => {
    if (isManuallySelected || carouselImages.length <= 1) return

    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % carouselImages.length)
    }, 3000)

    return () => clearInterval(timer)
  }, [isManuallySelected, carouselImages.length])

  // Manual selection handler
  const handleSelectVariant = (e: React.MouseEvent, variant: ProductVariant) => {
    e.preventDefault()
    e.stopPropagation()
    setIsManuallySelected(true)
    setSelectedVariant(variant)
  }

  // Active variant: manual selection takes precedence, then autoplay carousel variant, then default variant
  const activeVariant = useMemo(() => {
    if (isManuallySelected && selectedVariant) return selectedVariant
    if (carouselVariants.length > 1) return carouselVariants[carouselIndex]
    return sortedVariants[0] || product.variants?.[0]
  }, [isManuallySelected, selectedVariant, carouselVariants, carouselIndex, sortedVariants, product.variants])

  // Current image to display
  const currentImage = useMemo(() => {
    if (isManuallySelected && selectedVariant?.imageUrl) {
      return selectedVariant.imageUrl
    }
    if (carouselImages.length > 1) {
      return carouselImages[carouselIndex] || sortedVariants[0]?.imageUrl || product.images?.[0]
    }
    return sortedVariants[0]?.imageUrl || product.images?.[0]
  }, [isManuallySelected, selectedVariant, carouselImages, carouselIndex, sortedVariants, product.images])

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const variant = activeVariant || product.variants?.[0]
    if (!variant) return
    const result = addItem(product, variant, 1)
    if (!result.ok) { toast.error(t('outOfStock')); return }
    if (result.capped) toast.warning(t('stockLimit'))
    else toast.success(t('addedToCart'), { preset: 'bouncy' })
  }

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      await wishlistApi.toggle(product.id)
      toast.success(t('addedToWishlist'), { preset: 'bouncy' })
    } catch {
      toast.error(t('wishlistError'))
    }
  }

  const defaultVariant = product.variants?.[0]
  const isOutOfStock = (activeVariant || defaultVariant)?.status === 'out_of_stock'
  const isPriceTbd = (activeVariant || defaultVariant)?.sku?.includes('-PRICE-TBD-')
  const variants = product.variants || []
  const hasMultipleVariants = variants.length > 1
  const prices = variants.map(v => v.priceTTC).filter(p => p > 0)
  const minPrice = prices.length ? Math.min(...prices) : (defaultVariant?.priceTTC || 0)
  const maxPrice = prices.length ? Math.max(...prices) : (defaultVariant?.priceTTC || 0)

  const oldPrice =
    product.isPromo &&
    product.promoPercent &&
    product.promoPercent > 0 &&
    product.promoPercent < 100 &&
    (activeVariant || defaultVariant)
      ? (activeVariant || defaultVariant)!.priceTTC / (1 - product.promoPercent / 100)
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
      return null;
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
            <CardImage
              key={currentImage}
              src={currentImage}
              alt={product.name}
              brand={product.brand?.name}
              sku={formatSKU(activeVariant?.sku || defaultVariant?.sku)}
              t={t}
            />
          </Link>
          
          {/* Mini dot indicators if multiple images sliding */}
          {carouselImages.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1 items-center bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded-full shadow-xs">
              {carouselImages.map((img, idx) => {
                const isActive = (isManuallySelected && currentImage === img) || (!isManuallySelected && carouselIndex === idx)
                return (
                  <span
                    key={img || idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isActive ? 'w-3.5 bg-[#16254c]' : 'w-1.5 bg-slate-300'
                    }`}
                  />
                )
              })}
            </div>
          )}

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
            {product.isFeatured && (
              <span className="flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700">
                <Star size={8} fill="currentColor" />
                VIP
              </span>
            )}
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
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                  <Check size={14} strokeWidth={3} /> {t('inStock')}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-bold text-rose-500">
                  <X size={14} strokeWidth={3} /> {t('outOfStock')}
                </span>
              )}
            </div>

            {/* Volumes available — interactive pills */}
            {hasMultipleVariants && sortedVariants.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1">
                {sortedVariants.map((v) => {
                  const isSelected = activeVariant?.id ? activeVariant.id === v.id : activeVariant?.volume === v.volume
                  return (
                    <button
                      key={v.id || v.volume}
                      type="button"
                      onClick={(e) => handleSelectVariant(e, v)}
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-[#16254c] text-white shadow-xs ring-1 ring-[#D4A76A]'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {v.volume}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Price */}
            <div className="flex flex-col">
              {isPriceTbd ? (
                <span className="text-lg font-bold text-[#16254c]">{t('priceNa')}</span>
              ) : isManuallySelected && activeVariant ? (
                <>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-[#16254c]">{formatPrice(activeVariant.priceTTC)}</span>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">TTC</span>
                  </div>
                  {product.isPromo && oldPrice > 0 && (
                    <span className="text-sm text-gray-400 line-through mt-0.5">
                      {formatPrice(oldPrice)}
                    </span>
                  )}
                </>
              ) : hasMultipleVariants && minPrice !== maxPrice ? (
                <>
                  <span className="text-[10px] text-gray-500 font-medium">À partir de</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-[#16254c]">{formatPrice(minPrice)}</span>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">TTC</span>
                  </div>
                </>
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
              className="flex min-h-[40px] flex-1 items-center justify-center gap-2 bg-[#16254c] text-xs font-black uppercase tracking-wider text-white shadow-sm transition-colors hover:bg-[#1f356b] hover:text-[#D4A76A] disabled:cursor-not-allowed disabled:bg-gray-300"
              aria-label={t('addToCart')}
            >
              <ShoppingCart size={15} />
              {t('addToCart')}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToWishlist}
              className="hidden h-10 w-10 shrink-0 items-center justify-center border border-gray-200 bg-white text-gray-400 transition-colors hover:border-[#D4A76A] hover:text-[#D4A76A] sm:flex"
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
          {product.isFeatured && (
            <span className="flex items-center gap-1 bg-amber-400 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-900 shadow-sm">
              <Star size={8} fill="currentColor" />
              VIP
            </span>
          )}
          {product.isNew && (
            <span className="bg-[#16254c] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
              {t('new')}
            </span>
          )}
          {product.isPromo && (
            <span className="bg-[#D4A76A] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#16254c]">
              {t('promo')}{product.promoPercent ? ` -${product.promoPercent}%` : ''}
            </span>
          )}
        </div>

        {/* Top-right: Wishlist */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-400 shadow-sm border border-gray-100 backdrop-blur transition-colors hover:text-[#D4A76A]"
          onClick={handleAddToWishlist}
          aria-label={t('addToWishlist')}
        >
          <Heart size={14} />
        </motion.button>

        {/* Clickable image */}
        <Link href={`/produit/${product.slug}`} className="absolute inset-0 z-0">
          <CardImage
            key={currentImage}
            src={currentImage}
            alt={product.name}
            brand={product.brand?.name}
            sku={formatSKU(activeVariant?.sku || defaultVariant?.sku)}
            t={t}
          />
        </Link>

        {/* Mini dot indicators if multiple images sliding in autoplay */}
        {carouselImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1 items-center bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded-full shadow-xs">
            {carouselImages.map((img, idx) => {
              const isActive = (isManuallySelected && currentImage === img) || (!isManuallySelected && carouselIndex === idx)
              return (
                <span
                  key={img || idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isActive ? 'w-3.5 bg-[#16254c]' : 'w-1.5 bg-slate-300'
                  }`}
                />
              )
            })}
          </div>
        )}
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

        {/* Volumes available — interactive swatches */}
        {hasMultipleVariants && sortedVariants.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {sortedVariants.map((v) => {
              const isSelected = activeVariant?.id ? activeVariant.id === v.id : activeVariant?.volume === v.volume
              return (
                <button
                  key={v.id || v.volume}
                  type="button"
                  onClick={(e) => handleSelectVariant(e, v)}
                  className={`rounded px-1.5 py-0.5 text-[9px] font-bold transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-[#16254c] text-white shadow-xs ring-1 ring-[#D4A76A]'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {v.volume}
                </button>
              )
            })}
          </div>
        )}

        <div className="mt-3 flex items-end justify-between border-t border-gray-100 pt-3">
          {/* Price */}
          <div className="flex flex-col">
            <span className="mb-0.5 flex items-center gap-1 text-[10px] font-bold">
              {!isOutOfStock ? (
                <span className="text-emerald-600">{t('inStock')}</span>
              ) : (
                <span className="text-rose-500">{t('outOfStock')}</span>
              )}
            </span>
            
            {isPriceTbd ? (
              <span className="text-sm font-bold text-[#16254c]">{t('priceNa')}</span>
            ) : isManuallySelected && activeVariant ? (
              <div className="flex items-baseline gap-1">
                <span className="text-base font-black text-[#16254c] sm:text-lg">
                  {formatPrice(activeVariant.priceTTC)}
                </span>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">TTC</span>
              </div>
            ) : hasMultipleVariants && minPrice !== maxPrice ? (
              <div>
                <span className="block text-[9px] text-gray-500 font-medium">À partir de</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-black text-[#16254c] sm:text-lg">
                    {formatPrice(minPrice)}
                  </span>
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">TTC</span>
                </div>
              </div>
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
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#16254c] text-white shadow-sm transition-colors hover:bg-[#1f356b] hover:text-[#D4A76A] disabled:cursor-not-allowed disabled:bg-gray-300 sm:h-10 sm:w-10"
            aria-label={t('addToCart')}
          >
            <ShoppingCart size={16} />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
