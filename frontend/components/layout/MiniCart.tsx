"use client";

import { useCartStore } from '@/lib/store/cart.store'
import { formatPrice } from '@/lib/utils/format'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet'
import { ShoppingCart, Trash2, Plus, Minus, Package, ArrowRight, ShoppingBag } from 'lucide-react'
import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useHasMounted } from '@/lib/hooks/useHasMounted'
import { useTranslations } from 'next-intl'
import { CrossSellSuggestions } from '@/components/cart/CrossSellSuggestions'
import { PartsWhatsAppCheckout } from '@/components/cart/PartsWhatsAppCheckout'

export default function MiniCart() {
  const {
    items,
    itemCount,
    itemsTotalTTC,
    totalTTC,
    freeShippingThreshold,
    updateQuantity,
    removeItem,
  } = useCartStore()
  const hasMounted = useHasMounted()
  const visibleItems = hasMounted ? items : []
  const visibleItemCount = hasMounted ? itemCount : 0
  const visibleItemsTotalTTC = hasMounted ? itemsTotalTTC : 0
  const visibleTotalTTC = hasMounted ? totalTTC : 0
  const t = useTranslations('Cart')

  // Free shipping threshold from store (dynamic settings/DB)
  const threshold = freeShippingThreshold || 150
  const remaining = Math.max(0, threshold - visibleItemsTotalTTC)
  const progress = Math.min(100, (visibleItemsTotalTTC / threshold) * 100)

  return (
    <Sheet>
      <SheetTrigger
        render={
          <button
            className="relative flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-primary px-3 sm:px-4 text-sm font-bold text-white transition-all duration-200 hover:bg-brand-primary-light hover:shadow-lg hover:shadow-brand-primary/20 active:scale-95"
            aria-label={t('openCart')}
          />
        }
      >
        <span className="hidden sm:inline text-sm">{t('title')} / {formatPrice(visibleTotalTTC)}</span>
        <ShoppingCart size={18} />
        <AnimatePresence>
          {visibleItemCount > 0 && (
            <motion.span
              key={visibleItemCount}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 600, damping: 20 }}
              className="absolute -top-2 -right-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white shadow-md"
            >
              {visibleItemCount}
            </motion.span>
          )}
        </AnimatePresence>
      </SheetTrigger>

      <SheetContent className="flex h-full w-full flex-col bg-[#F8F9FC] p-0 sm:max-w-[420px]">
        {/* Header */}
        <SheetHeader className="bg-white px-5 py-4 border-b border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/10">
              <ShoppingBag size={18} className="text-brand-primary" />
            </div>
            <div>
              <SheetTitle className="text-brand-primary text-lg font-bold leading-tight">
                {t('myCart', { count: visibleItemCount })}
              </SheetTitle>
              {visibleItemCount > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">{t('itemsLabel', { count: visibleItemCount })}</p>
              )}
            </div>
          </div>

          {/* Free shipping progress bar */}
          {visibleItems.length > 0 && (
            <div className="mt-3">
              {remaining > 0 ? (
                <p className="text-xs text-gray-500 mb-1.5">
                  {t.rich('freeShippingProgress', {
                    amount: (chunks) => <span className="font-bold text-brand-primary">{chunks}</span>,
                    remaining: formatPrice(remaining),
                  })}
                </p>
              ) : (
                <p className="text-xs font-bold text-green-600 mb-1.5">{t('freeShippingUnlocked')}</p>
              )}
              <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-brand-primary to-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}
        </SheetHeader>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto">
          {visibleItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                <ShoppingCart size={36} className="text-gray-300" />
              </div>
              <div>
                <p className="font-semibold text-gray-700 text-base">{t('empty')}</p>
                <p className="text-sm text-gray-400 mt-1">{t('addProductsToStart')}</p>
              </div>
              <Link
                href="/catalogue"
                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-primary-light transition-colors"
              >
                {t('viewCatalog')} <ArrowRight size={15} />
              </Link>
            </motion.div>
          ) : (
            <div className="px-4 py-4 space-y-3">
              <AnimatePresence initial={false}>
                {visibleItems.map((item) => (
                  <motion.div
                    key={item.variantId}
                    layout
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.22 }}
                    className="flex gap-3 bg-white rounded-2xl p-3 shadow-sm border border-gray-100"
                  >
                    {/* Product image */}
                    <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl bg-gray-50 border border-gray-100">
                      {item.product.images?.[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          sizes="72px"
                          className="object-contain p-1"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package size={24} className="text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-1 flex-col justify-between min-w-0">
                      <div>
                        <h4 className="text-brand-primary line-clamp-2 text-sm font-semibold leading-snug">
                          {item.product.name}
                        </h4>
                        <span className="mt-0.5 inline-block rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                          {t('volume', { volume: item.variant.volume })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Qty stepper */}
                        <div className="flex items-center gap-1 rounded-xl bg-gray-50 border border-gray-200 p-0.5">
                          <button
                            onClick={() => {
                              if (item.quantity > 1) updateQuantity(item.variantId, item.quantity - 1)
                            }}
                            disabled={item.quantity <= 1}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label={t('decreaseQty')}
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center text-sm font-bold text-brand-primary">{item.quantity}</span>
                          <button
                            onClick={() => {
                              if (item.quantity < item.variant.stock) updateQuantity(item.variantId, item.quantity + 1)
                            }}
                            disabled={item.quantity >= item.variant.stock}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label={t('increaseQty')}
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-brand-primary">
                            {formatPrice(item.variant.priceTTC * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeItem(item.variantId)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-red-50 hover:text-red-400"
                            aria-label={t('remove')}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Cross-sell section inside scroll area */}
          {visibleItems.length > 0 && (
            <div className="px-4 pb-4">
              <CrossSellSuggestions />
            </div>
          )}
        </div>

        {/* Footer — Total + CTAs */}
        {visibleItems.length > 0 && (
          <div className="bg-white border-t border-gray-100 px-4 pt-4 pb-5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
            {/* WhatsApp parts handoff — appears as soon as the basket holds parts */}
            <PartsWhatsAppCheckout className="mb-4" />
            {/* Summary line */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500 font-medium">{t('totalTTC')}</span>
              <span className="text-2xl font-black text-brand-primary tracking-tight">
                {formatPrice(visibleTotalTTC)}
              </span>
            </div>
            {/* CTA buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <SheetClose render={<Link
                href="/panier"
                className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-brand-primary/20 bg-brand-primary/5 py-3 text-sm font-bold text-brand-primary transition-all hover:border-brand-primary/40 hover:bg-brand-primary/10 active:scale-95"
              />}>
                {t('viewCart')}
              </SheetClose>
              <SheetClose render={<Link
                href="/checkout"
                className="flex items-center justify-center gap-1.5 rounded-xl bg-brand-primary py-3 text-sm font-bold text-white transition-all hover:bg-brand-primary-light hover:shadow-lg hover:shadow-brand-primary/30 active:scale-95"
              />}>
                {t('checkout')} <ArrowRight size={14} />
              </SheetClose>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
