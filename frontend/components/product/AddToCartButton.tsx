"use client";

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ShoppingCart, Plus, Minus } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Product, ProductVariant } from '@/lib/types'
import { useCartStore } from '@/lib/store/cart.store'
import { toast } from 'sonner'

interface Props {
  product: Product
  variant: ProductVariant
}

export function AddToCartButton({ product, variant }: Props) {
  const t = useTranslations('Product')
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCartStore()

  const stock = variant.stock ?? Number.POSITIVE_INFINITY
  const isOutOfStock = variant.status === 'out_of_stock' || stock <= 0

  const handleAddToCart = () => {
    if (isOutOfStock) return
    const result = addItem(product, variant, quantity)
    if (!result.ok) {
      toast.error(t('outOfStock'))
      return
    }
    if (result.capped) {
      toast.warning(t('stockLimit'))
    } else {
      toast.success(t('addedToCart'))
    }
  }

  const increase = () => {
    setQuantity((prev) => {
      if (prev + 1 > stock) {
        toast.warning(t('stockLimit'))
        return prev
      }
      return prev + 1
    })
  }

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row">
      <div className="border-brand-surface-dark flex h-14 w-full shrink-0 items-center rounded-full border-2 bg-white px-2 sm:w-32">
        <button
          onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
          className="hover:text-brand-primary flex h-10 w-10 items-center justify-center text-gray-500"
          disabled={isOutOfStock || quantity <= 1}
          aria-label="-"
        >
          <Minus size={18} />
        </button>
        <span className="flex-1 text-center text-lg font-semibold">{quantity}</span>
        <button
          onClick={increase}
          className="hover:text-brand-primary flex h-10 w-10 items-center justify-center text-gray-500"
          disabled={isOutOfStock || quantity >= stock}
          aria-label="+"
        >
          <Plus size={18} />
        </button>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className="btn-primary flex h-14 flex-1 items-center justify-center gap-3 text-lg"
      >
        <ShoppingCart size={22} />
        {isOutOfStock ? t('outOfStock') : t('addToCart')}
      </motion.button>
    </div>
  )
}
