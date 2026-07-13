"use client";

import { useCartStore } from '@/lib/store/cart.store'
import { formatPrice } from '@/lib/utils/format'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react'
import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { useHasMounted } from '@/lib/hooks/useHasMounted'
import { useTranslations } from 'next-intl'

export default function MiniCart() {
  const { items, itemCount, totalTTC, updateQuantity, removeItem } = useCartStore()
  const hasMounted = useHasMounted()
  const visibleItems = hasMounted ? items : []
  const visibleItemCount = hasMounted ? itemCount : 0
  const visibleTotalTTC = hasMounted ? totalTTC : 0
  const t = useTranslations('Cart')

  return (
    <Sheet>
      <SheetTrigger
        render={
          <button
            className="relative flex h-11 w-11 items-center justify-center rounded-lg text-brand-primary/70 transition-colors duration-200 hover:bg-brand-primary/5 hover:text-brand-primary"
            aria-label={t('openCart')}
          />
        }
      >
        <ShoppingCart size={24} />
        {visibleItemCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-accent px-1 text-xs font-bold text-brand-primary">
            {visibleItemCount}
          </span>
        )}
      </SheetTrigger>
      <SheetContent className="flex h-full w-full flex-col bg-brand-card sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-brand-primary text-xl font-semibold">
            {t('myCart', { count: visibleItemCount })}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6">
          {visibleItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-gray-500">
              <ShoppingCart size={48} className="mb-4 text-gray-300" />
              <p>{t('empty')}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {visibleItems.map((item) => (
                <div key={item.variantId} className="flex gap-4">
                  <div className="bg-brand-surface relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-brand-border">
                    {item.product.images?.[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-brand-surface-dark" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h4 className="text-brand-primary line-clamp-2 text-sm font-medium">
                        {item.product.name}
                      </h4>
                      <p className="mt-1 text-xs text-gray-500">{t('volume', { volume: item.variant.volume })}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-lg border border-brand-border bg-brand-surface">
                        <button
                          onClick={() => {
                            if (item.quantity > 1) updateQuantity(item.variantId, item.quantity - 1)
                          }}
                          disabled={item.quantity <= 1}
                          className="flex h-10 w-10 items-center justify-center text-gray-600 transition-colors duration-150 hover:bg-brand-surface-dark disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label={t('decreaseQty')}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => {
                            if (item.quantity < item.variant.stock) updateQuantity(item.variantId, item.quantity + 1)
                          }}
                          disabled={item.quantity >= item.variant.stock}
                          className="flex h-10 w-10 items-center justify-center text-gray-600 transition-colors duration-150 hover:bg-brand-surface-dark disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label={t('increaseQty')}
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
                          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-500"
                          aria-label={t('remove')}
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

        {visibleItems.length > 0 && (
          <div className="mt-auto border-t border-brand-border pt-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-gray-600">{t('totalTTC')}</span>
              <span className="text-brand-primary text-xl font-bold">{formatPrice(visibleTotalTTC)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/panier" className="btn-secondary py-2 text-center">
                {t('viewCart')}
              </Link>
              <Link href="/checkout" className="btn-primary py-2 text-center">
                {t('checkout')}
              </Link>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
