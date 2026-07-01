import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import { OrderSummary } from '@/components/checkout/OrderSummary'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Paiement | BestLub',
  description: 'Validez votre commande en toute sécurité.',
}

export default function CheckoutPage() {
  return (
    <div className="bg-brand-surface min-h-screen">
      <div className="section-padding py-8">
        <Breadcrumb items={[{ label: 'Panier', href: '/panier' }, { label: 'Paiement' }]} />

        <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Main Form */}
          <div className="flex-1">
            <h1 className="font-display text-brand-primary mb-8 text-3xl font-bold">
              Finaliser votre commande
            </h1>
            <CheckoutForm />
          </div>

          {/* Sticky Summary */}
          <div className="w-full shrink-0 lg:w-[420px]">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  )
}
