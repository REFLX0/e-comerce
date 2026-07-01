import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import { OrderSummary } from '@/components/checkout/OrderSummary'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { ShieldCheck, Truck, Lock } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Paiement | KiosqueTN',
  description: 'Validez votre commande en toute sécurité.',
}

export default function CheckoutPage() {
  return (
    <div className="bg-brand-surface min-h-screen">
      <div className="section-padding py-8">
        <Breadcrumb items={[{ label: 'Panier', href: '/panier' }, { label: 'Paiement' }]} />

        {/* Trust bar */}
        <div className="mt-6 mb-8 flex flex-wrap items-center justify-center gap-6 rounded-xl bg-white/70 backdrop-blur-sm border border-brand-surface-dark p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Lock size={16} className="text-brand-primary" />
            <span className="font-medium">Paiement 100% Sécurisé</span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-gray-300" />
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Truck size={16} className="text-green-600" />
            <span className="font-medium">Livraison Gratuite 24H</span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-gray-300" />
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ShieldCheck size={16} className="text-blue-600" />
            <span className="font-medium">Produits Authentiques</span>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Main Form */}
          <div className="flex-1 animate-fade-in-up">
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
