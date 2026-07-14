import { CartSummary } from '@/components/checkout/CartSummary'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Cart' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default async function CartPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Cart' })

  return (
    <div className="section-padding bg-brand-surface min-h-screen py-8">
      <Breadcrumb items={[{ label: t('title') }]} />
      <div className="mt-8">
        <CartSummary />
      </div>
    </div>
  )
}
