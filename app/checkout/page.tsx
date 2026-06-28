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
        <Breadcrumb
          items={[
            { label: 'Panier', href: '/panier' },
            { label: 'Paiement' },
          ]}
        />

        <div className="mt-8 flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Main Form */}
          <div className="flex-1">
            <h1 className="text-3xl font-display font-bold text-brand-primary mb-8">
              Finaliser votre commande
            </h1>
            <CheckoutForm />
          </div>

          {/* Sticky Summary */}
          <div className="w-full lg:w-[420px] shrink-0">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  )
}
