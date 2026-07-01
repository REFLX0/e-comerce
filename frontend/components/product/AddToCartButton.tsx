"use client";

import { useState } from 'react'
import { ShoppingCart, Plus, Minus } from 'lucide-react'
import type { Product, ProductVariant } from '@/lib/types'
import { useCartStore } from '@/lib/store/cart.store'
import { toast } from 'sonner'

interface Props {
  product: Product
  variant: ProductVariant
}

export function AddToCartButton({ product, variant }: Props) {
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCartStore()

  const isOutOfStock = variant.status === 'out_of_stock'

  const handleAddToCart = () => {
    if (isOutOfStock) return
    addItem(product, variant, quantity)
    toast.success('Produit ajouté au panier')
  }

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row">
      <div className="border-brand-surface-dark flex h-14 w-full shrink-0 items-center rounded-full border-2 bg-white px-2 sm:w-32">
        <button
          onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
          className="hover:text-brand-primary flex h-10 w-10 items-center justify-center text-gray-500"
          disabled={isOutOfStock}
        >
          <Minus size={18} />
        </button>
        <span className="flex-1 text-center text-lg font-semibold">{quantity}</span>
        <button
          onClick={() => setQuantity((prev) => prev + 1)}
          className="hover:text-brand-primary flex h-10 w-10 items-center justify-center text-gray-500"
          disabled={isOutOfStock}
        >
          <Plus size={18} />
        </button>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className="btn-primary flex h-14 flex-1 items-center justify-center gap-3 text-lg"
      >
        <ShoppingCart size={22} />
        {isOutOfStock ? 'Rupture de stock' : 'Ajouter au panier'}
      </button>
    </div>
  )
}
