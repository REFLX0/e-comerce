"use client";

import { useSyncExternalStore } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { ShoppingCart, Heart, Check, X } from 'lucide-react'
import type { Product } from '@/lib/types'
import { useCartStore } from '@/lib/store/cart.store'
import { useVehicleStore } from '@/lib/store/vehicle.store'
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
    // By default, add the first variant
    if (product.variants && product.variants.length > 0) {
      addItem(product, product.variants[0]!, 1)
      toast.success('Produit ajouté au panier')
    }
  }

  const defaultVariant = product.variants?.[0]
  const oldPrice = defaultVariant ? defaultVariant.priceHT * 1.2 : 0

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-[#E10600]/30 hover:shadow-lg">
      {/* Image with Badges */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 p-2">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 items-start">
          {product.isPromo && (
            <span className="rounded-md bg-red-500 px-2.5 py-1 text-[10px] font-bold tracking-normal text-white uppercase shadow-sm">
              {t('promo')} {product.promoPercent ? `-${product.promoPercent}%` : ''}
            </span>
          )}
          {product.isNew && (
            <span className="rounded-md bg-[#E10600] px-2.5 py-1 text-[10px] font-bold tracking-normal text-white uppercase shadow-sm">
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
        <button 
          className="absolute top-3 right-3 z-10 flex h-10 w-10 translate-y-0 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-400 opacity-100 shadow-sm backdrop-blur transition-all duration-200 hover:bg-white hover:text-[#E10600] hover:border-[#E10600]/20 sm:-translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
          onClick={(e) => { e.preventDefault(); toast.success('Ajouté à la liste de souhaits') }}
           aria-label={t('addToWishlist')}
         >
           <Heart size={18} />
         </button>

         <Link href={`/produit/${product.slug}`} className="absolute inset-0 z-0">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-contain p-5 transition-transform duration-200 ease-out group-hover:scale-[1.03]"
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
            <span className="text-xs font-black tracking-wider text-[#E10600] uppercase">
              {product.brand.name}
            </span>
          )}
          <h3 className="line-clamp-2 min-h-10 text-sm leading-snug font-bold text-[#111] transition-colors duration-200 group-hover:text-[#E10600]">
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
          <button
            onClick={handleAddToCart}
            disabled={defaultVariant?.status === 'out_of_stock'}
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded bg-[#E10600] py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 hover:bg-[#b80500] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t('addToCart')}
          >
            {t('addToCart')}
          </button>
          
          <button 
            className="flex h-11 w-11 items-center justify-center rounded border border-gray-200 bg-gray-50 text-gray-400 transition-all duration-200 hover:border-[#E10600] hover:text-[#E10600] focus:outline-none"
            onClick={(e) => { e.preventDefault(); toast.success('Ajouté à la liste de souhaits') }}
            aria-label={t('addToWishlist')}
          >
            <Heart size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
