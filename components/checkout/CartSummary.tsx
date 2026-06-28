'use client'

import { useCartStore } from '@/lib/store/cart.store'
import { formatPrice } from '@/lib/utils/format'
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export function CartSummary() {
  const { items, subtotalHT, totalTTC, shippingCost, updateQuantity, removeItem } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-brand-surface-dark p-12 text-center shadow-sm">
        <div className="w-24 h-24 bg-brand-surface rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
          <Trash2 size={48} />
        </div>
        <h2 className="text-2xl font-display font-bold text-brand-primary mb-4">
          Votre panier est vide
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Découvrez notre catalogue et trouvez l'huile idéale pour votre moteur.
        </p>
        <Link href="/catalogue" className="btn-primary inline-flex">
          Parcourir le catalogue
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Cart Items */}
      <div className="flex-1 bg-white rounded-2xl border border-brand-surface-dark p-6 shadow-sm">
        <h2 className="text-xl font-display font-bold text-brand-primary mb-6 border-b border-gray-100 pb-4">
          Détail de votre panier ({items.length} produit{items.length > 1 ? 's' : ''})
        </h2>
        
        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.variantId} className="flex flex-col sm:flex-row gap-6 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
              <div className="relative w-24 h-24 bg-brand-surface rounded-xl overflow-hidden shrink-0">
                {item.product.images?.[0] ? (
                  <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>
              
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-semibold text-brand-primary hover:text-brand-accent transition-colors">
                      <Link href={`/produit/${item.product.slug}`}>{item.product.name}</Link>
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Volume : {item.variant.volume}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2 -mr-2"
                    title="Supprimer"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center border-2 border-brand-surface-dark rounded-full h-10 px-1 bg-white">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-brand-primary"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-10 text-center font-semibold text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-brand-primary"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-brand-primary">
                      {formatPrice(item.variant.priceTTC * item.quantity)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatPrice(item.variant.priceTTC)} / unité
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Side */}
      <div className="w-full lg:w-[380px] shrink-0">
        <div className="bg-white rounded-2xl border border-brand-surface-dark p-6 shadow-sm sticky top-24">
          <h3 className="text-lg font-display font-bold text-brand-primary mb-6">
            Récapitulatif
          </h3>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-gray-600 text-sm">
              <span>Total HT</span>
              <span>{formatPrice(subtotalHT)}</span>
            </div>
            <div className="flex justify-between text-gray-600 text-sm">
              <span>TVA (19%)</span>
              <span>{formatPrice(totalTTC - subtotalHT)}</span>
            </div>
            <div className="flex justify-between text-gray-600 text-sm">
              <span>Frais de livraison</span>
              {shippingCost === 0 ? (
                <span className="text-green-500 font-medium">Gratuite</span>
              ) : (
                <span>{formatPrice(shippingCost)}</span>
              )}
            </div>
            
            {shippingCost > 0 && (
              <div className="bg-brand-primary/5 text-brand-primary p-3 rounded-lg text-xs">
                Plus que {formatPrice(100 - totalTTC)} pour profiter de la livraison gratuite !
              </div>
            )}
            
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="font-bold text-brand-primary">Total TTC</span>
              <span className="font-display font-bold text-2xl text-brand-accent">
                {formatPrice(totalTTC + shippingCost)}
              </span>
            </div>
          </div>
          
          <Link 
            href="/checkout" 
            className="w-full btn-primary flex justify-center items-center gap-2 py-4 text-lg"
          >
            Valider la commande
            <ArrowRight size={20} />
          </Link>
          
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
            <span>🔒</span> Paiement sécurisé à la livraison
          </div>
        </div>
      </div>
    </div>
  )
}
