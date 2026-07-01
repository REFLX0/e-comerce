"use client";

import { useCartStore } from '@/lib/store/cart.store'
import { formatPrice } from '@/lib/utils/format'
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export function CartSummary() {
  const { items, subtotalHT, totalTTC, shippingCost, updateQuantity, removeItem } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="border-brand-surface-dark rounded-2xl border bg-white p-12 text-center shadow-sm">
        <div className="bg-brand-surface mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full text-gray-300">
          <Trash2 size={48} />
        </div>
        <h2 className="font-display text-brand-primary mb-4 text-2xl font-bold">
          Votre panier est vide
        </h2>
        <p className="mx-auto mb-8 max-w-md text-gray-500">
          Découvrez notre catalogue et trouvez l'huile idéale pour votre moteur.
        </p>
        <Link href="/catalogue" className="btn-primary inline-flex">
          Parcourir le catalogue
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      {/* Cart Items */}
      <div className="border-brand-surface-dark flex-1 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="font-display text-brand-primary mb-6 border-b border-gray-100 pb-4 text-xl font-bold">
          Détail de votre panier ({items.length} produit{items.length > 1 ? 's' : ''})
        </h2>

        <div className="space-y-6">
          {items.map((item) => (
            <div
              key={item.variantId}
              className="flex flex-col gap-6 border-b border-gray-100 pb-6 last:border-0 last:pb-0 sm:flex-row"
            >
              <div className="bg-brand-surface relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
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
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-brand-primary hover:text-brand-accent font-semibold transition-colors">
                      <Link href={`/produit/${item.product.slug}`}>{item.product.name}</Link>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">Volume : {item.variant.volume}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="-mr-2 p-2 text-gray-400 transition-colors hover:text-red-500"
                    title="Supprimer"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="border-brand-surface-dark flex h-10 items-center rounded-full border-2 bg-white px-1">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="hover:text-brand-primary flex h-8 w-8 items-center justify-center text-gray-500"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="hover:text-brand-primary flex h-8 w-8 items-center justify-center text-gray-500"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="text-brand-primary text-lg font-bold">
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
      <div className="w-full shrink-0 lg:w-[380px]">
        <div className="border-brand-surface-dark sticky top-24 rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="font-display text-brand-primary mb-6 text-lg font-bold">Récapitulatif</h3>

          <div className="mb-6 space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Total HT</span>
              <span>{formatPrice(subtotalHT)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>TVA (19%)</span>
              <span>{formatPrice(totalTTC - subtotalHT - shippingCost)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Frais de livraison</span>
              {shippingCost === 0 ? (
                <span className="font-medium text-green-500">Gratuite</span>
              ) : (
                <span>{formatPrice(shippingCost)}</span>
              )}
            </div>

            {shippingCost > 0 && (
              <div className="bg-brand-primary/5 text-brand-primary rounded-lg p-3 text-xs">
                Plus que {formatPrice(100 - subtotalHT)} pour profiter de la livraison gratuite !
              </div>
            )}

            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="text-brand-primary font-bold">Total TTC</span>
              <span className="font-display text-brand-accent text-2xl font-bold">
                {formatPrice(totalTTC)}
              </span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="btn-primary flex w-full items-center justify-center gap-2 py-4 text-lg"
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
