"use client";

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useEffect, useState } from 'react'
import { useCartStore } from '@/lib/store/cart.store'
import { ordersApi } from '@/lib/api/orders'
import { couponsApi } from '@/lib/api/coupons'
import { shippingApi } from '@/lib/api/shipping'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Check, Tag, X, Truck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { WILAYAS_TN } from '@/lib/utils/format'
import { FormInput, FormSelect, FormTextarea } from '@/components/common/FormInput'

export function CheckoutForm() {
  const t = useTranslations('Checkout')
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [promoInput, setPromoInput] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoError, setPromoError] = useState('')
  const {
    items,
    shippingCost,
    promoCode,
    promoDiscount,
    promoType,
    itemsTotalTTC,
    eta,
    clearCart,
    applyPromo,
    removePromo,
    setSelectedWilaya,
  } = useCartStore()

  const checkoutSchema = z.object({
    firstName: z.string().min(2, t('firstNameTooShort')),
    lastName: z.string().min(2, t('lastNameTooShort')),
    email: z.string().email(t('emailInvalid')),
    phone: z.string().regex(/^[0-9]{8}$/, t('phoneInvalid')),
    address: z.string().min(5, t('addressTooShort')),
    city: z.string().min(2, t('cityRequired')),
    wilaya: z.string().min(1, t('wilayaRequired')),
    postalCode: z.string().min(4, t('postalCodeRequired')),
    vehicleVin: z
      .string()
      .trim()
      .refine(
        (value) => value === '' || /^[A-HJ-NPR-Z0-9]{17}$/i.test(value),
        t('invalidVin')
      )
      .optional(),
    notes: z.string().optional(),
  })

  type CheckoutFormData = z.infer<typeof checkoutSchema>

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  })

  const watchedWilaya = watch('wilaya')

  // Dynamically update shipping tariff and ETA when destination wilaya changes
  useEffect(() => {
    if (!watchedWilaya) return
    let isMounted = true
    shippingApi
      .calculateRate(watchedWilaya, itemsTotalTTC)
      .then((res) => {
        if (isMounted && res) {
          setSelectedWilaya(watchedWilaya, res.basePrice, res.eta)
        }
      })
      .catch((e) => {
        console.warn('Failed to calculate rate for wilaya', e)
      })
    return () => {
      isMounted = false
    }
  }, [watchedWilaya, itemsTotalTTC, setSelectedWilaya])

  const rawSubtotal = items.reduce((acc, item) => acc + item.variant.priceHT * item.quantity, 0)

  const handleApplyPromo = async () => {
    const code = promoInput.trim()
    if (!code) return
    setPromoLoading(true)
    setPromoError('')
    try {
      const res = await couponsApi.validate(code, rawSubtotal)
      if (res.type === 'SHIPPING') {
        applyPromo(code, 0, 'SHIPPING')
      } else {
        applyPromo(code, res.discount, res.type)
      }
      setPromoInput('')
      toast.success(t('promoApplied'))
    } catch (err: any) {
      setPromoError(err?.response?.data?.message || err?.message || t('invalidPromo'))
    } finally {
      setPromoLoading(false)
    }
  }

  const handleRemovePromo = () => {
    removePromo()
    toast.success(t('promoRemoved'))
  }

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) {
      toast.error(t('emptyCart'))
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
          shipping: {
            fullName: `${data.firstName} ${data.lastName}`,
            phone: data.phone,
            wilaya: data.wilaya,
            city: data.city,
          },
          notes: data.notes,
          vehicleVin: data.vehicleVin?.trim() || undefined,
          shippingCost,
          promoCode,
        }
      )

      clearCart()
      toast.success(t('orderPlaced'))
      router.push(`/checkout/success?orderId=${order.id}`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('orderError')
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
          {t('shippingInfo')}
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormInput
            id="firstName"
            label={t('firstName')}
            required
            placeholder={t('firstNamePlaceholder')}
            error={errors.firstName?.message}
            {...register('firstName')}
          />

          <FormInput
            id="lastName"
            label={t('lastName')}
            required
            placeholder={t('lastNamePlaceholder')}
            error={errors.lastName?.message}
            {...register('lastName')}
          />

          <FormInput
            id="email"
            label="Email"
            required
            type="email"
            placeholder={t('emailPlaceholder')}
            error={errors.email?.message}
            {...register('email')}
          />

          <FormInput
            id="phone"
            label={t('phone')}
            required
            placeholder={t('phonePlaceholder')}
            error={errors.phone?.message}
            {...register('phone')}
          />

          <div className="md:col-span-2">
            <FormInput
              id="address"
              label={t('addressLabel')}
              required
              placeholder={t('addressPlaceholder')}
              error={errors.address?.message}
              {...register('address')}
            />
          </div>

          <div>
            <FormSelect
              id="wilaya"
              label={t('wilayaLabel')}
              required
              placeholder={t('selectPlaceholder')}
              options={WILAYAS_TN.map((w) => ({ value: w, label: w }))}
              error={errors.wilaya?.message}
              {...register('wilaya')}
            />
            {watchedWilaya && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-green-700 font-medium">
                <Truck size={13} />
                <span>
                  Livraison estimée : <strong className="font-bold">{eta || '24-48h'}</strong>
                  {shippingCost === 0 ? (
                    <span className="ml-1 rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-800">
                      Offerte
                    </span>
                  ) : (
                    <span className="ml-1 text-gray-600">({shippingCost.toFixed(3)} DT)</span>
                  )}
                </span>
              </p>
            )}
          </div>

          <FormInput
            id="city"
            label={t('cityLabel')}
            required
            placeholder={t('cityPlaceholder')}
            error={errors.city?.message}
            {...register('city')}
          />

          <FormInput
            id="postalCode"
            label={t('postalCodeLabel')}
            required
            placeholder={t('postalCodePlaceholder')}
            error={errors.postalCode?.message}
            {...register('postalCode')}
          />

          <div className="md:col-span-2">
            <FormInput
              id="vehicleVin"
              label={t('vin')}
              placeholder={t('vinPlaceholder')}
              maxLength={17}
              autoCapitalize="characters"
              error={errors.vehicleVin?.message}
              {...register('vehicleVin')}
            />
            <p className="mt-1 text-xs text-gray-500">{t('vinHint')}</p>
          </div>

          <div className="md:col-span-2">
            <FormTextarea
              id="notes"
              label={t('notesLabel')}
              placeholder={t('deliveryInstructions')}
              error={errors.notes?.message}
              {...register('notes')}
            />
          </div>
        </div>
      </div>

      <div className="border-brand-surface-dark rounded-2xl border bg-white p-6 shadow-card md:p-8 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
        <h2 className="font-display text-brand-primary mb-6 flex items-center gap-3 border-b border-gray-100 pb-4 text-xl font-bold">
          <div className="bg-brand-primary flex h-8 w-8 items-center justify-center rounded-full text-sm text-white">
            2
          </div>
          {t('promoCodeTitle')}
        </h2>
        {promoCode ? (
          <div className="bg-brand-primary/10 flex items-center justify-between rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Tag size={20} className="text-brand-primary" />
              <div>
                <p className="font-bold text-gray-900">{promoCode}</p>
                <p className="text-sm text-gray-600">
                  {promoDiscount > 0
                    ? `-${promoDiscount.toFixed(3)} TND`
                    : t('freeShipping')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemovePromo}
              className="rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder={t('promoPlaceholder')}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-gray-400"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyPromo())}
              />
              {promoError && <p className="mt-1 text-xs text-red-500">{promoError}</p>}
            </div>
            <button
              type="button"
              onClick={handleApplyPromo}
              disabled={promoLoading || !promoInput.trim()}
              className="bg-brand-primary rounded-xl px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {promoLoading ? '...' : t('apply')}
            </button>
          </div>
        )}
      </div>

      <div className="border-brand-surface-dark rounded-2xl border bg-white p-6 shadow-card md:p-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <h2 className="font-display text-brand-primary mb-6 flex items-center gap-3 border-b border-gray-100 pb-4 text-xl font-bold">
          <div className="bg-brand-primary flex h-8 w-8 items-center justify-center rounded-full text-sm text-white">
            3
          </div>
          {t('payment')}
        </h2>

        <div className="border-brand-primary bg-brand-primary/5 flex items-start gap-4 rounded-xl border-2 p-4">
          <div className="mt-1">
            <div className="bg-brand-primary flex h-6 w-6 items-center justify-center rounded-full text-white">
              <Check size={14} />
            </div>
          </div>
          <div>
            <h3 className="text-brand-primary font-bold">{t('cod')}</h3>
            <p className="mt-1 text-sm text-gray-600">
              {t('codDescription')}
            </p>
          </div>
        </div>
      </div>
    </form>
  )
}
