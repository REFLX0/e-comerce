"use client";

import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { ShoppingCart } from 'lucide-react'
import type { Product } from '@/lib/types'
import { useCartStore } from '@/lib/store/cart.store'
import { PriceDisplay } from '../common/PriceDisplay'
import { RatingStars } from '../common/RatingStars'
import { toast } from 'sonner'
import { StockIndicator } from '../common/StockIndicator'

interface Props {
  product: Product
}

export function ProductCard({ product }: Props) {
  const { addItem } = useCartStore()

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
      <div className="bg-brand-surface relative aspect-square overflow-hidden rounded-t-2xl">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
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
        </div>

        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <span className="text-sm text-gray-400">Image non disponible</span>
          </div>
        )}

        {/* Quick-add overlay */}
        <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center bg-gradient-to-t from-black/60 via-black/20 to-transparent p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            onClick={handleAddToCart}
            disabled={defaultVariant?.status === 'out_of_stock'}
            className="btn-primary flex h-10 items-center gap-2 px-5 text-sm shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingCart size={16} />
            Ajouter
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Brand & Category */}
        <div className="mb-2 flex items-center justify-between">
          {product.brand && (
            <span className="text-brand-accent text-[10px] font-bold tracking-widest uppercase">
              {product.brand.name}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-brand-primary group-hover:text-brand-accent mb-2 line-clamp-2 min-h-[44px] text-sm font-semibold leading-snug transition-colors duration-200">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="mb-2">
          <RatingStars rating={product.rating} count={product.reviewCount} />
        </div>

        {/* Stock */}
        <div className="mb-3">
          <StockIndicator status={defaultVariant?.status || 'out_of_stock'} />
        </div>

        {/* Price */}
        <div className="border-brand-surface-dark border-t pt-3">
          {defaultVariant ? (
            <PriceDisplay
              priceHT={defaultVariant.priceHT}
              priceTTC={defaultVariant.priceTTC}
              isPromo={product.isPromo}
              promoPercent={product.promoPercent}
              oldPriceHT={oldPrice}
            />
          ) : (
            <span className="text-sm text-gray-500">Prix non disponible</span>
          )}
        </div>
      </div>
    </Link>
  )
}
