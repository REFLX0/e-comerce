"use client";

import { useSyncExternalStore } from 'react'
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
    <Link href={`/produit/${product.slug}`} className="group product-card relative block overflow-hidden">
      {/* Image with Badges */}
      <div className="relative aspect-square overflow-hidden bg-brand-surface">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 items-start">
          {product.isPromo && (
            <span className="rounded-md bg-red-500 px-2.5 py-1 text-[10px] font-bold tracking-normal text-white uppercase shadow-sm">
              PROMO {product.promoPercent ? `-${product.promoPercent}%` : ''}
            </span>
          )}
          {product.isNew && (
            <span className="rounded-md bg-brand-primary px-2.5 py-1 text-[10px] font-bold tracking-normal text-white uppercase shadow-sm">
              NOUVEAU
            </span>
          )}
          {mounted && vehicle && (
            <span className="flex items-center gap-1 rounded-md border border-green-400 bg-green-500 px-2.5 py-1 text-[10px] font-bold tracking-normal text-white uppercase shadow-sm">
              <Check size={10} strokeWidth={3} /> COMPATIBLE
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button 
          className="absolute top-3 right-3 z-10 flex h-10 w-10 translate-y-0 items-center justify-center rounded-lg border border-brand-border bg-white/90 text-gray-400 opacity-100 shadow-sm backdrop-blur transition-all duration-200 hover:bg-white hover:text-red-500 sm:-translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
          onClick={(e) => { e.preventDefault(); toast.success('Ajouté à la liste de souhaits') }}
          aria-label="Ajouter à la liste de souhaits"
        >
          <Heart size={18} />
        </button>

        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-contain p-5 transition-transform duration-200 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-50">
            <span className="text-xs text-gray-400">Image non disponible</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-4">
        {/* Brand */}
        {product.brand && (
          <span className="text-xs font-bold tracking-normal text-brand-accent uppercase">
            {product.brand.name}
          </span>
        )}

        {/* Title */}
        <h3 className="line-clamp-2 min-h-10 text-sm leading-snug font-semibold text-brand-primary transition-colors duration-200 group-hover:text-brand-accent">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <RatingStars rating={product.rating} count={product.reviewCount} />
          {product.reviewCount > 0 && <span className="text-xs text-gray-400">({product.reviewCount})</span>}
        </div>

        {/* Specs Preview */}
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-medium text-gray-500">
          {defaultVariant?.volume && (
            <span className="rounded-md bg-brand-surface px-1.5 py-0.5">{defaultVariant.volume}</span>
          )}
          {product.specs?.viscosity && (
            <span className="rounded-md bg-brand-surface px-1.5 py-0.5">{product.specs.viscosity}</span>
          )}
          {product.specs?.approvals?.[0] && (
            <span className="max-w-[100px] truncate rounded-md bg-brand-surface px-1.5 py-0.5" title={product.specs.approvals[0]}>
              {product.specs.approvals[0]}
            </span>
          )}
        </div>

        {/* Price & Stock */}
        <div className="mt-2 flex items-end justify-between border-t border-brand-border pt-3">
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
              <span className="text-sm text-gray-500">Prix N/D</span>
            )}
            
            <div className="mt-1 flex items-center gap-1 text-[11px] font-medium">
              {defaultVariant?.status !== 'out_of_stock' ? (
                <span className="flex items-center gap-1 text-green-600"><Check size={12} /> En stock</span>
              ) : (
                <span className="flex items-center gap-1 text-red-500"><X size={12} /> Rupture</span>
              )}
            </div>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={defaultVariant?.status === 'out_of_stock'}
          className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-primary py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-brand-accent hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingCart size={16} />
          Ajouter au panier
        </button>
      </div>
    </Link>
  )
}
