'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState } from 'react'
import { useCartStore } from '@/lib/store/cart.store'
import { useAuthStore } from '@/lib/store/auth.store'
import { ordersApi } from '@/lib/api/orders'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { WILAYAS_TN } from '@/lib/utils/format'

const checkoutSchema = z.object({
  firstName: z.string().min(2, 'Prénom trop court'),
  lastName: z.string().min(2, 'Nom trop court'),
  email: z.string().email('Email invalide'),
  phone: z.string().regex(/^[0-9]{8}$/, 'Numéro tunisien 8 chiffres'),
  address: z.string().min(5, 'Adresse trop courte'),
  city: z.string().min(2, 'Ville requise'),
  wilaya: z.string().min(1, 'Wilaya requise'),
  postalCode: z.string().min(4, 'Code postal requis'),
  notes: z.string().optional(),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

export function CheckoutForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { items, clearCart } = useCartStore()
  const { token } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  })

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) {
      toast.error('Votre panier est vide')
      return
    }

    setIsLoading(true)
    try {
      const order = await ordersApi.create({
        items: items.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        shippingAddress: {
          fullName: `${data.firstName} ${data.lastName}`,
          phone: data.phone,
          address: data.address,
          city: data.city,
          wilaya: data.wilaya,
          postalCode: data.postalCode,
        },
        shippingMethod: 'standard',
        notes: data.notes,
      }, token || '')

      clearCart()
      toast.success('Commande validée avec succès !')
      router.push(`/checkout/success?orderId=${order.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue lors de la validation')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="bg-white rounded-2xl border border-brand-surface-dark p-6 md:p-8 shadow-sm">
        <h2 className="text-xl font-display font-bold text-brand-primary mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm">1</div>
          Informations de Livraison
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Prénom *</label>
            <input
              {...register('firstName')}
              className={`w-full p-3 rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                errors.firstName ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-brand-primary focus:ring-brand-primary/20'
              }`}
              placeholder="Votre prénom"
            />
            {errors.firstName && <span className="text-xs text-red-500">{errors.firstName.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nom *</label>
            <input
              {...register('lastName')}
              className={`w-full p-3 rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                errors.lastName ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-brand-primary focus:ring-brand-primary/20'
              }`}
              placeholder="Votre nom"
            />
            {errors.lastName && <span className="text-xs text-red-500">{errors.lastName.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email *</label>
            <input
              {...register('email')}
              type="email"
              className={`w-full p-3 rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-brand-primary focus:ring-brand-primary/20'
              }`}
              placeholder="votre@email.com"
            />
            {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Téléphone *</label>
            <input
              {...register('phone')}
              className={`w-full p-3 rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                errors.phone ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-brand-primary focus:ring-brand-primary/20'
              }`}
              placeholder="Ex: 98765432"
            />
            {errors.phone && <span className="text-xs text-red-500">{errors.phone.message}</span>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Adresse de livraison *</label>
            <input
              {...register('address')}
              className={`w-full p-3 rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                errors.address ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-brand-primary focus:ring-brand-primary/20'
              }`}
              placeholder="Numéro, rue, appartement..."
            />
            {errors.address && <span className="text-xs text-red-500">{errors.address.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Gouvernorat (Wilaya) *</label>
            <select
              {...register('wilaya')}
              className={`w-full p-3 rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                errors.wilaya ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-brand-primary focus:ring-brand-primary/20'
              }`}
            >
              <option value="">Sélectionner...</option>
              {WILAYAS_TN.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
            {errors.wilaya && <span className="text-xs text-red-500">{errors.wilaya.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Ville *</label>
            <input
              {...register('city')}
              className={`w-full p-3 rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                errors.city ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-brand-primary focus:ring-brand-primary/20'
              }`}
              placeholder="Votre ville"
            />
            {errors.city && <span className="text-xs text-red-500">{errors.city.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Code Postal *</label>
            <input
              {...register('postalCode')}
              className={`w-full p-3 rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                errors.postalCode ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-brand-primary focus:ring-brand-primary/20'
              }`}
              placeholder="Ex: 1000"
            />
            {errors.postalCode && <span className="text-xs text-red-500">{errors.postalCode.message}</span>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Notes de livraison (Optionnel)</label>
            <textarea
              {...register('notes')}
              className="w-full p-3 rounded-lg border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:outline-none transition-all h-24 resize-none"
              placeholder="Instructions particulières pour le livreur..."
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-brand-surface-dark p-6 md:p-8 shadow-sm">
        <h2 className="text-xl font-display font-bold text-brand-primary mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm">2</div>
          Paiement
        </h2>
        
        <div className="p-4 border-2 border-brand-primary bg-brand-primary/5 rounded-xl flex items-start gap-4">
          <div className="mt-1">
            <div className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center">
              <Check size={14} />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-brand-primary">Paiement à la livraison</h3>
            <p className="text-sm text-gray-600 mt-1">
              Payez en espèces lorsque vous recevez votre commande. C'est simple, rapide et 100% sécurisé.
            </p>
          </div>
        </div>
      </div>
    </form>
  )
}
