import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { useTranslations } from 'next-intl'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { Truck, Timer, CreditCard, MapPin, PackageSearch } from 'lucide-react'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Shipping' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default function LivraisonPage() {
  const t = useTranslations('Shipping')
  const features = t.raw('features') as Array<{ icon: string; title: string; desc: string }>
  const zones = t.raw('zones') as Array<{ label: string; desc: string }>

  return (
    <>
      <section className="from-brand-primary to-brand-primary-dark bg-gradient-to-br py-16 text-white">
        <div className="section-padding text-center">
          <h1 className="font-display mb-4 text-4xl font-bold md:text-5xl">{t('title')}</h1>
          <p className="text-white/70">{t('subtitle')}</p>
        </div>
      </section>

      <div className="section-padding mx-auto max-w-4xl py-12">
        <Breadcrumb items={[{ label: t('title') }]} />

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {features.map((f) => {
            const Icon =
              f.icon === 'timer'
                ? Timer
                : f.icon === 'credit-card'
                  ? CreditCard
                  : f.icon === 'map-pin'
                    ? MapPin
                    : Truck
            return (
              <div key={f.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <Icon className="mb-3 text-brand-primary" size={28} />
                <h2 className="text-brand-primary font-display mb-2 font-bold">{f.title}</h2>
                <p className="text-sm leading-relaxed text-gray-600">{f.desc}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-brand-primary font-display mb-6 flex items-center gap-2 font-bold">
            <MapPin size={20} /> {t('zonesTitle')}
          </h2>
          <div className="divide-y divide-gray-50">
            {zones.map((z) => (
              <div key={z.label} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-semibold text-gray-800">{z.label}</p>
                <p className="text-sm text-gray-500">{z.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-8 text-sm leading-relaxed text-gray-500">{t('contactNote')}</p>
      </div>
    </>
  )
}