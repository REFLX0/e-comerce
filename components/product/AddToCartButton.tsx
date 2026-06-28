'use client'

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
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <div className="flex items-center border-2 border-brand-surface-dark rounded-full h-14 w-full sm:w-32 bg-white px-2 shrink-0">
        <button
          onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
          className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-brand-primary"
          disabled={isOutOfStock}
        >
          <Minus size={18} />
        </button>
        <span className="flex-1 text-center font-semibold text-lg">{quantity}</span>
        <button
          onClick={() => setQuantity((prev) => prev + 1)}
          className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-brand-primary"
          disabled={isOutOfStock}
        >
          <Plus size={18} />
        </button>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className="flex-1 h-14 btn-primary flex items-center justify-center gap-3 text-lg"
      >
        <ShoppingCart size={22} />
        {isOutOfStock ? 'Rupture de stock' : 'Ajouter au panier'}
      </button>
    </div>
  )
}
