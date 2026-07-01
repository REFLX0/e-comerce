"use client";

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState } from 'react'
import { useCartStore } from '@/lib/store/cart.store'

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
      const order = await ordersApi.create(
        {
          items: items.map((item) => ({
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
        }
      )

      clearCart()
      toast.success('Commande validée avec succès !')
      router.push(`/checkout/success?orderId=${order.id}`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Une erreur est survenue lors de la validation'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="border-brand-surface-dark rounded-2xl border bg-white p-6 shadow-card md:p-8 animate-fade-in-up">
        <h2 className="font-display text-brand-primary mb-6 flex items-center gap-3 border-b border-gray-100 pb-4 text-xl font-bold">
          <div className="bg-brand-primary flex h-8 w-8 items-center justify-center rounded-full text-sm text-white">
            1
          </div>
          Informations de Livraison
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Prénom *</label>
            <input
              {...register('firstName')}
              className={`w-full rounded-lg border p-3 transition-all focus:ring-2 focus:outline-none ${
                errors.firstName
                  ? 'border-red-500 focus:ring-red-200'
                  : 'focus:border-brand-primary focus:ring-brand-primary/20 border-gray-300'
              }`}
              placeholder="Votre prénom"
            />
            {errors.firstName && (
              <span className="text-xs text-red-500">{errors.firstName.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nom *</label>
            <input
              {...register('lastName')}
              className={`w-full rounded-lg border p-3 transition-all focus:ring-2 focus:outline-none ${
                errors.lastName
                  ? 'border-red-500 focus:ring-red-200'
                  : 'focus:border-brand-primary focus:ring-brand-primary/20 border-gray-300'
              }`}
              placeholder="Votre nom"
            />
            {errors.lastName && (
              <span className="text-xs text-red-500">{errors.lastName.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email *</label>
            <input
              {...register('email')}
              type="email"
              className={`w-full rounded-lg border p-3 transition-all focus:ring-2 focus:outline-none ${
                errors.email
                  ? 'border-red-500 focus:ring-red-200'
                  : 'focus:border-brand-primary focus:ring-brand-primary/20 border-gray-300'
              }`}
              placeholder="votre@email.com"
            />
            {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Téléphone *</label>
            <input
              {...register('phone')}
              className={`w-full rounded-lg border p-3 transition-all focus:ring-2 focus:outline-none ${
                errors.phone
                  ? 'border-red-500 focus:ring-red-200'
                  : 'focus:border-brand-primary focus:ring-brand-primary/20 border-gray-300'
              }`}
              placeholder="Ex: 98765432"
            />
            {errors.phone && <span className="text-xs text-red-500">{errors.phone.message}</span>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Adresse de livraison *</label>
            <input
              {...register('address')}
              className={`w-full rounded-lg border p-3 transition-all focus:ring-2 focus:outline-none ${
                errors.address
                  ? 'border-red-500 focus:ring-red-200'
                  : 'focus:border-brand-primary focus:ring-brand-primary/20 border-gray-300'
              }`}
              placeholder="Numéro, rue, appartement..."
            />
            {errors.address && (
              <span className="text-xs text-red-500">{errors.address.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Gouvernorat (Wilaya) *</label>
            <select
              {...register('wilaya')}
              className={`w-full rounded-lg border p-3 transition-all focus:ring-2 focus:outline-none ${
                errors.wilaya
                  ? 'border-red-500 focus:ring-red-200'
                  : 'focus:border-brand-primary focus:ring-brand-primary/20 border-gray-300'
              }`}
            >
              <option value="">Sélectionner...</option>
              {WILAYAS_TN.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
            {errors.wilaya && <span className="text-xs text-red-500">{errors.wilaya.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Ville *</label>
            <input
              {...register('city')}
              className={`w-full rounded-lg border p-3 transition-all focus:ring-2 focus:outline-none ${
                errors.city
                  ? 'border-red-500 focus:ring-red-200'
                  : 'focus:border-brand-primary focus:ring-brand-primary/20 border-gray-300'
              }`}
              placeholder="Votre ville"
            />
            {errors.city && <span className="text-xs text-red-500">{errors.city.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Code Postal *</label>
            <input
              {...register('postalCode')}
              className={`w-full rounded-lg border p-3 transition-all focus:ring-2 focus:outline-none ${
                errors.postalCode
                  ? 'border-red-500 focus:ring-red-200'
                  : 'focus:border-brand-primary focus:ring-brand-primary/20 border-gray-300'
              }`}
              placeholder="Ex: 1000"
            />
            {errors.postalCode && (
              <span className="text-xs text-red-500">{errors.postalCode.message}</span>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">
              Notes de livraison (Optionnel)
            </label>
            <textarea
              {...register('notes')}
              className="focus:border-brand-primary focus:ring-brand-primary/20 h-24 w-full resize-none rounded-lg border border-gray-300 p-3 transition-all focus:ring-2 focus:outline-none"
              placeholder="Instructions particulières pour le livreur..."
            />
          </div>
        </div>
      </div>

      <div className="border-brand-surface-dark rounded-2xl border bg-white p-6 shadow-card md:p-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <h2 className="font-display text-brand-primary mb-6 flex items-center gap-3 border-b border-gray-100 pb-4 text-xl font-bold">
          <div className="bg-brand-primary flex h-8 w-8 items-center justify-center rounded-full text-sm text-white">
            2
          </div>
          Paiement
        </h2>

        <div className="border-brand-primary bg-brand-primary/5 flex items-start gap-4 rounded-xl border-2 p-4">
          <div className="mt-1">
            <div className="bg-brand-primary flex h-6 w-6 items-center justify-center rounded-full text-white">
              <Check size={14} />
            </div>
          </div>
          <div>
            <h3 className="text-brand-primary font-bold">Paiement à la livraison</h3>
            <p className="mt-1 text-sm text-gray-600">
              Payez en espèces lorsque vous recevez votre commande. C'est simple, rapide et 100%
              sécurisé.
            </p>
          </div>
        </div>
      </div>
    </form>
  )
}
