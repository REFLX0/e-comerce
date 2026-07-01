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
    <Link href={`/produit/${product.slug}`} className="group product-card relative block p-4">
      {/* Image with Badges */}
      <div className="bg-brand-surface relative mb-4 aspect-square overflow-hidden rounded-xl">
        {/* Badges - Now inside the image container so they never overlap text below */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {product.isPromo && (
            <span className="rounded bg-red-500 px-2 py-1 text-xs font-bold text-white shadow-sm">
              PROMO {product.promoPercent ? `-${product.promoPercent}%` : ''}
            </span>
          )}
          {product.isNew && (
            <span className="bg-brand-primary rounded px-2 py-1 text-xs font-bold text-white shadow-sm">
              NOUVEAU
            </span>
          )}
        </div>

        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <span className="text-sm text-gray-400">Image non disponible</span>
          </div>
        )}
      </div>

      {/* Brand & Category */}
      <div className="mb-2 flex items-center justify-between">
        {product.brand && (
          <span className="text-brand-primary text-xs font-semibold tracking-wider uppercase">
            {product.brand.name}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-brand-primary group-hover:text-brand-accent mb-1 line-clamp-2 min-h-[48px] font-medium transition-colors">
        {product.name}
      </h3>

      {/* Rating */}
      <div className="mb-3">
        <RatingStars rating={product.rating} count={product.reviewCount} />
      </div>

      {/* Stock */}
      <div className="mb-4">
        <StockIndicator status={defaultVariant?.status || 'out_of_stock'} />
      </div>

      {/* Price & Add to Cart */}
      <div className="border-brand-surface-dark mt-auto flex items-end justify-between border-t pt-4">
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

        <button
          onClick={handleAddToCart}
          disabled={defaultVariant?.status === 'out_of_stock'}
          className="bg-brand-surface text-brand-primary hover:bg-brand-accent flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          title="Ajouter au panier"
        >
          <ShoppingCart size={20} />
        </button>
      </div>
    </Link>
  )
}
