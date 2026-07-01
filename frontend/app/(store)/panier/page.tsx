import { CartSummary } from '@/components/checkout/CartSummary'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Votre Panier | BestLub',
  description: 'Consultez et modifiez les articles de votre panier.',
}

export default function CartPage() {
  return (
    <div className="section-padding bg-brand-surface min-h-screen py-8">
      <Breadcrumb items={[{ label: 'Panier' }]} />
      <div className="mt-8">
        <CartSummary />
      </div>
    </div>
  )
}
