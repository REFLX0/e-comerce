"use client";

import { useCartStore } from '@/lib/store/cart.store'
import { formatPrice } from '@/lib/utils/format'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function MiniCart() {
  const { items, itemCount, totalTTC, updateQuantity, removeItem } = useCartStore()

  return (
    <Sheet>
      <SheetTrigger
        render={
          <button className="text-brand-primary hover:text-brand-primary-light relative p-2 transition-colors" />
        }
      >
        <ShoppingCart size={24} />
        {itemCount > 0 && (
          <span className="bg-brand-accent absolute top-0 right-0 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white">
            {itemCount}
          </span>
        )}
      </SheetTrigger>
      <SheetContent className="flex h-full w-full flex-col bg-white sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-brand-primary text-xl font-semibold">
            Mon Panier ({itemCount})
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-gray-500">
              <ShoppingCart size={48} className="mb-4 text-gray-300" />
              <p>Votre panier est vide</p>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-4">
                  <div className="bg-brand-surface relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                    {item.product.images?.[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h4 className="text-brand-primary line-clamp-2 text-sm font-medium">
                        {item.product.name}
                      </h4>
                      <p className="mt-1 text-xs text-gray-500">Volume: {item.variant.volume}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-md border border-gray-200">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="p-1 text-gray-600 hover:bg-gray-100"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="p-1 text-gray-600 hover:bg-gray-100"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-brand-primary font-bold">
                          {formatPrice(item.variant.priceTTC * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="text-gray-400 transition-colors hover:text-red-500"
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
          <div className="mt-auto border-t border-gray-100 pt-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-gray-600">Total TTC</span>
              <span className="text-brand-primary text-xl font-bold">{formatPrice(totalTTC)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/panier" className="btn-secondary py-2 text-center">
                Voir le panier
              </Link>
              <Link href="/checkout" className="btn-primary py-2 text-center">
                Commander
              </Link>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
