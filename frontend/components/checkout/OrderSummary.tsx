"use client";

import { useState } from 'react'
import { useCartStore } from '@/lib/store/cart.store'
import { formatPrice } from '@/lib/utils/format'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

export function OrderSummary() {
  const t = useTranslations('Checkout')
  const tCart = useTranslations('Cart')
  const { items, subtotalHT, totalTTC, shippingCost } = useCartStore()
  const [cgvAccepted, setCgvAccepted] = useState(false)

  return (
    <div className="bg-brand-primary shadow-card sticky top-24 rounded-2xl p-6 text-white md:p-8">
      <h2 className="font-display mb-6 border-b border-white/10 pb-4 text-xl font-bold">
        {t('orderSummary')}
      </h2>

      <div className="custom-scrollbar mb-8 max-h-[300px] space-y-4 overflow-y-auto pr-2">
        {items.map((item) => (
          <div key={item.variantId} className="flex gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white">
              {item.product.images?.[0] ? (
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  fill
                  className="object-cover p-1"
                />
              ) : (
                <div className="h-full w-full bg-gray-200" />
              )}
              <span className="bg-brand-accent absolute -top-2 -right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white">
                {item.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="line-clamp-2 text-sm font-medium text-white/90">
                {item.product.name}
              </h4>
              <p className="mt-1 text-xs text-white/60">Volume: {item.variant.volume}</p>
            </div>
            <div className="shrink-0 text-right">
              <span className="text-sm font-bold">
                {formatPrice(item.variant.priceTTC * item.quantity)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 space-y-3 border-t border-white/10 pt-6">
        <div className="flex justify-between text-sm text-white/70">
          <span>{t('subtotalHT')}</span>
          <span>{formatPrice(subtotalHT)}</span>
        </div>
        <div className="flex justify-between text-sm text-white/70">
          <span>{t('vat')}</span>
          <span>{formatPrice(totalTTC - subtotalHT - shippingCost)}</span>
        </div>
        <div className="flex justify-between text-sm text-white/70">
          <span>{t('delivery')}</span>
          {shippingCost === 0 ? (
            <span className="font-medium text-green-400">{tCart('free')}</span>
          ) : (
            <span>{formatPrice(shippingCost)}</span>
          )}
        </div>
      </div>

      <div className="mb-8 border-t border-white/10 pt-6">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">Total TTC</span>
          <span className="font-display text-brand-accent text-3xl font-bold">
            {formatPrice(totalTTC)}
          </span>
        </div>
      </div>

      <div className="mb-6 flex items-start gap-3">
        <input
          type="checkbox"
          id="cgv"
          checked={cgvAccepted}
          onChange={(e) => setCgvAccepted(e.target.checked)}
          className="text-brand-accent focus:ring-brand-accent focus:ring-offset-brand-primary mt-1 h-4 w-4 rounded border-white/20 bg-white/10"
        />
        <label htmlFor="cgv" className="text-xs leading-snug text-white/80">
          J'ai lu et j'accepte les{' '}
          <a href="/cgv" target="_blank" className="underline hover:text-white">
            {t('cgv')}
          </a>{' '}
          de KiosqueTN.
        </label>
      </div>

      <button
        type="submit"
        form="checkout-form"
        disabled={!cgvAccepted}
        className="text-brand-primary w-full rounded-full bg-white py-4 text-lg font-bold transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t('confirmOrder')}
      </button>
    </div>
  )
}
