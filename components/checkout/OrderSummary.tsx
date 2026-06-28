'use client'

import { useCartStore } from '@/lib/store/cart.store'
import { formatPrice } from '@/lib/utils/format'
import Image from 'next/image'

export function OrderSummary() {
  const { items, subtotalHT, totalTTC, shippingCost } = useCartStore()

  return (
    <div className="bg-brand-primary rounded-2xl p-6 md:p-8 text-white sticky top-24 shadow-card">
      <h2 className="text-xl font-display font-bold mb-6 border-b border-white/10 pb-4">
        Résumé de la commande
      </h2>

      <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {items.map((item) => (
          <div key={item.variantId} className="flex gap-4">
            <div className="relative w-16 h-16 bg-white rounded-lg overflow-hidden shrink-0">
              {item.product.images?.[0] ? (
                <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover p-1" />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-brand-accent text-white rounded-full flex items-center justify-center text-xs font-bold z-10">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm line-clamp-2 text-white/90">
                {item.product.name}
              </h4>
              <p className="text-xs text-white/60 mt-1">Volume: {item.variant.volume}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="font-bold text-sm">
                {formatPrice(item.variant.priceTTC * item.quantity)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 mb-6 border-t border-white/10 pt-6">
        <div className="flex justify-between text-white/70 text-sm">
          <span>Sous-total HT</span>
          <span>{formatPrice(subtotalHT)}</span>
        </div>
        <div className="flex justify-between text-white/70 text-sm">
          <span>TVA</span>
          <span>{formatPrice(totalTTC - subtotalHT)}</span>
        </div>
        <div className="flex justify-between text-white/70 text-sm">
          <span>Livraison</span>
          {shippingCost === 0 ? (
            <span className="text-green-400 font-medium">Gratuite</span>
          ) : (
            <span>{formatPrice(shippingCost)}</span>
          )}
        </div>
      </div>

      <div className="border-t border-white/10 pt-6 mb-8">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">Total TTC</span>
          <span className="text-3xl font-display font-bold text-brand-accent">
            {formatPrice(totalTTC + shippingCost)}
          </span>
        </div>
      </div>

      <button
        type="submit"
        form="checkout-form"
        className="w-full bg-white text-brand-primary hover:bg-gray-100 font-bold py-4 rounded-full transition-colors text-lg"
      >
        Confirmer la commande
      </button>
      
      <p className="text-center text-xs text-white/50 mt-4">
        En confirmant votre commande, vous acceptez nos Conditions Générales de Vente.
      </p>
    </div>
  )
}
