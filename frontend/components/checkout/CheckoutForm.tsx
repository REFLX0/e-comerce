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
import { FormInput, FormSelect, FormTextarea } from '@/components/common/FormInput'

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
          <FormInput
            id="firstName"
            label="Prénom"
            required
            placeholder="Votre prénom"
            error={errors.firstName?.message}
            {...register('firstName')}
          />

          <FormInput
            id="lastName"
            label="Nom"
            required
            placeholder="Votre nom"
            error={errors.lastName?.message}
            {...register('lastName')}
          />

          <FormInput
            id="email"
            label="Email"
            required
            type="email"
            placeholder="votre@email.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <FormInput
            id="phone"
            label="Téléphone"
            required
            placeholder="Ex: 98765432"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <div className="md:col-span-2">
            <FormInput
              id="address"
              label="Adresse de livraison"
              required
              placeholder="Numéro, rue, appartement..."
              error={errors.address?.message}
              {...register('address')}
            />
          </div>

          <FormSelect
            id="wilaya"
            label="Gouvernorat (Wilaya)"
            required
            placeholder="Sélectionner..."
            options={WILAYAS_TN.map((w) => ({ value: w, label: w }))}
            error={errors.wilaya?.message}
            {...register('wilaya')}
          />

          <FormInput
            id="city"
            label="Ville"
            required
            placeholder="Votre ville"
            error={errors.city?.message}
            {...register('city')}
          />

          <FormInput
            id="postalCode"
            label="Code Postal"
            required
            placeholder="Ex: 1000"
            error={errors.postalCode?.message}
            {...register('postalCode')}
          />

          <div className="md:col-span-2">
            <FormTextarea
              id="notes"
              label="Notes de livraison (Optionnel)"
              placeholder="Instructions particulières pour le livreur..."
              error={errors.notes?.message}
              {...register('notes')}
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
