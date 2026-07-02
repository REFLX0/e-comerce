"use client";

import { useEffect, useState } from 'react'
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

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
    <Link href={`/produit/${product.slug}`} className="group product-card relative block overflow-hidden rounded-2xl bg-white border border-gray-100 hover:border-brand-accent/30 transition-all duration-300 hover:shadow-xl">
      {/* Image with Badges */}
      <div className="bg-brand-surface relative aspect-square overflow-hidden">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 items-start">
          {product.isPromo && (
            <span className="rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white uppercase shadow-sm">
              PROMO {product.promoPercent ? `-${product.promoPercent}%` : ''}
            </span>
          )}
          {product.isNew && (
            <span className="bg-brand-primary rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider text-white uppercase shadow-sm">
              NOUVEAU
            </span>
          )}
          {mounted && vehicle && (
            <span className="bg-green-500 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider text-white uppercase shadow-sm flex items-center gap-1 border border-green-400">
              <Check size={10} strokeWidth={3} /> COMPATIBLE
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button 
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur text-gray-400 hover:text-red-500 hover:bg-white transition-all shadow-sm opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0"
          onClick={(e) => { e.preventDefault(); toast.success('Ajouté à la liste de souhaits') }}
        >
          <Heart size={18} />
        </button>

        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-50">
            <span className="text-xs text-gray-400">Image non disponible</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2">
        {/* Brand */}
        {product.brand && (
          <span className="text-brand-accent text-xs font-bold tracking-widest uppercase">
            {product.brand.name}
          </span>
        )}

        {/* Title */}
        <h3 className="text-brand-primary group-hover:text-brand-accent line-clamp-2 text-sm font-semibold leading-snug transition-colors duration-200 min-h-[40px]">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <RatingStars rating={product.rating} count={product.reviewCount} />
          {product.reviewCount > 0 && <span className="text-xs text-gray-400">({product.reviewCount})</span>}
        </div>

        {/* Specs Preview */}
        <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium flex-wrap mt-1">
          {defaultVariant?.volume && (
            <span className="bg-gray-100 px-1.5 py-0.5 rounded">{defaultVariant.volume}</span>
          )}
          {product.specs?.viscosity && (
            <span className="bg-gray-100 px-1.5 py-0.5 rounded">{product.specs.viscosity}</span>
          )}
          {product.specs?.approvals?.[0] && (
            <span className="bg-gray-100 px-1.5 py-0.5 rounded truncate max-w-[100px]" title={product.specs.approvals[0]}>
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
          className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-brand-primary py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-accent hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingCart size={16} />
          Ajouter au panier
        </button>
      </div>
    </Link>
  )
}
