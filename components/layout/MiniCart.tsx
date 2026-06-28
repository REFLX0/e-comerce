'use client'

import { useCartStore } from '@/lib/store/cart.store'
import { formatPrice } from '@/lib/utils/format'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export function MiniCart() {
  const { items, itemCount, totalTTC, updateQuantity, removeItem } = useCartStore()

  return (
    <Sheet>
      <SheetTrigger render={<button className="relative p-2 text-brand-primary hover:text-brand-primary-light transition-colors" />}>
          <ShoppingCart size={24} />
          {itemCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-brand-accent rounded-full">
              {itemCount}
            </span>
          )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-white">
        <SheetHeader>
          <SheetTitle className="text-xl font-display font-semibold text-brand-primary">
            Mon Panier ({itemCount})
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ShoppingCart size={48} className="text-gray-300 mb-4" />
              <p>Votre panier est vide</p>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-4">
                  <div className="relative w-20 h-20 bg-brand-surface rounded-lg overflow-hidden shrink-0">
                    {item.product.images?.[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-medium text-sm text-brand-primary line-clamp-2">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Volume: {item.variant.volume}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-200 rounded-md">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="p-1 hover:bg-gray-100 text-gray-600"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 text-gray-600"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-brand-primary">
                          {formatPrice(item.variant.priceTTC * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-100 pt-6 mt-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600">Total TTC</span>
              <span className="text-xl font-bold text-brand-primary">
                {formatPrice(totalTTC)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/panier"
                className="btn-secondary text-center py-2"
              >
                Voir le panier
              </Link>
              <Link
                href="/checkout"
                className="btn-primary text-center py-2"
              >
                Commander
              </Link>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
