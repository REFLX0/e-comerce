"use client";

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ShoppingCart, Plus, Minus, MessageCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Product, ProductVariant } from '@/lib/types'
import { useCartStore } from '@/lib/store/cart.store'
import { toast } from 'sonner'

interface Props {
  product: Product
  variant: ProductVariant
}

// Slugs of categories that require WhatsApp compatibility/stock check
const SENSITIVE_CATEGORIES = [
  'auto-pieces-rechange',
  'auto-filtres',
  'auto-freinage',
  'auto-moteur-distribution',
  'auto-suspension-direction',
  'auto-transmission-embrayage',
  'auto-refroidissement-climatisation',
  'auto-electricite-eclairage',
  'auto-carrosserie-habitacle',
  'auto-echappement',
  'huiles-moteur',
  'direction-assistee',
  'transmission',
  'refroidissement',
  'adblue',
  'additif-essence',
  'additif-diesel',
  'additif-huile',
  'filtres'
]

// The support WhatsApp number
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+21655555555'

export function AddToCartButton({ product, variant }: Props) {
  const t = useTranslations('Product')
  const [quantity, setQuantity] = useState(1)
  const [showWhatsAppPrompt, setShowWhatsAppPrompt] = useState(false)
  const { addItem } = useCartStore()

  const stock = variant.stock ?? Number.POSITIVE_INFINITY
  const isOutOfStock = variant.status === 'out_of_stock' || stock <= 0
  
  // Check if the product belongs to a sensitive category
  const isSensitive = product.category?.slug && SENSITIVE_CATEGORIES.includes(product.category.slug)

  const handleAddToCart = () => {
    if (isOutOfStock) return
    
    if (isSensitive) {
      setShowWhatsAppPrompt(true)
      return
    }

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
  
  const handleWhatsAppRedirect = () => {
    const text = `Bonjour, je suis intéressé par la pièce "${product.name}" (Réf: ${variant.sku || product.slug}).\n\nVeuillez vérifier la disponibilité et la correspondance de cette pièce.\n\n[Insérez votre numéro de châssis / carte grise ici]`
    const url = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
    setShowWhatsAppPrompt(false)
  }

  return (
    <>
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
          {isSensitive ? <MessageCircle size={22} /> : <ShoppingCart size={22} />}
          {isOutOfStock ? t('outOfStock') : (isSensitive ? 'Vérifier la disponibilité' : t('addToCart'))}
        </motion.button>
      </div>

      <AnimatePresence>
        {showWhatsAppPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-primary/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <button 
                onClick={() => setShowWhatsAppPrompt(false)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X size={18} />
              </button>
              
              <div className="bg-[#25D366] px-6 py-8 text-center text-white">
                <MessageCircle size={48} className="mx-auto mb-4" />
                <h3 className="text-xl font-bold">Vérification de compatibilité</h3>
              </div>
              
              <div className="p-6">
                <p className="mb-4 text-center text-slate-600">
                  Pour ce type de pièce ({product.name}), nous devons vérifier la compatibilité exacte avec votre véhicule pour éviter les erreurs.
                </p>
                <p className="mb-6 text-center font-medium text-brand-primary">
                  Veuillez nous envoyer votre numéro de châssis (carte grise) sur WhatsApp.
                </p>
                
                <button
                  onClick={handleWhatsAppRedirect}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3.5 font-bold text-white transition-colors hover:bg-[#20b858]"
                >
                  <MessageCircle size={20} />
                  Continuer sur WhatsApp
                </button>
                
                <button
                  onClick={() => setShowWhatsAppPrompt(false)}
                  className="mt-3 w-full text-center text-sm font-medium text-slate-500 hover:text-brand-primary"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
