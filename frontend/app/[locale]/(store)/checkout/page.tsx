import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import { OrderSummary } from '@/components/checkout/OrderSummary'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { ShieldCheck, Truck, Lock } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Checkout' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Checkout' })

  return (
    <div className="bg-brand-surface min-h-screen">
      <div className="section-padding py-8">
        <Breadcrumb
          items={[{ label: t('breadcrumbCart'), href: '/panier' }, { label: t('payment') }]}
        />

        {/* Trust bar */}
        <div className="mt-6 mb-8 flex flex-wrap items-center justify-center gap-6 rounded-xl bg-white/70 backdrop-blur-sm border border-brand-surface-dark p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Lock size={16} className="text-brand-primary" />
            <span className="font-medium">{t('securePayment')}</span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-gray-300" />
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Truck size={16} className="text-green-600" />
            <span className="font-medium">{t('freeDelivery')}</span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-gray-300" />
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ShieldCheck size={16} className="text-blue-600" />
            <span className="font-medium">{t('authenticProducts')}</span>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Main Form */}
          <div className="flex-1 animate-fade-in-up">
            <h1 className="font-display text-brand-primary mb-8 text-3xl font-bold">
              {t('finalizeOrder')}
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
