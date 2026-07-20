import type { ElementType } from 'react'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { Shield, Award, Truck, Users, MapPin, Clock } from 'lucide-react'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'About' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default function AProposPage() {
  const t = useTranslations('About')
  const values = t.raw('values') as Array<{title: string, desc: string}>
  const stats = t.raw('stats') as Array<{value: string, label: string}>

  return (
    <>
      {/* Hero */}
      <section className="from-brand-primary to-brand-primary-dark bg-gradient-to-br py-16 text-white md:py-24">
        <div className="section-padding text-center">
          <h1 className="font-display mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
            {t('title1')} <span className="text-brand-accent">{t('title2')}</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/80 md:text-xl">
            {t('subtitle')}
          </p>
        </div>
      </section>

      <div className="section-padding py-12">
        <Breadcrumb items={[{ label: t('breadcrumb') }]} />

        {/* Story */}
        <section className="mx-auto mt-12 max-w-4xl">
          <h2 className="font-display text-brand-primary mb-6 text-3xl font-bold">
            {t('historyTitle')}
          </h2>
          <div className="prose prose-lg space-y-4 text-gray-600">
            <p dangerouslySetInnerHTML={{ __html: t.raw('historyP1') }} />
            <p dangerouslySetInnerHTML={{ __html: t.raw('historyP2') }} />
            <p dangerouslySetInnerHTML={{ __html: t.raw('historyP3') }} />
          </div>
        </section>

        {/* Values */}
        <section className="mt-16">
          <h2 className="font-display text-brand-primary mb-10 text-center text-3xl font-bold">
            {t('valuesTitle')}
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {values.map((v, idx) => {
              const Icon = [Shield, Award, Truck, Users, MapPin, Clock][idx] as ElementType
              return (
                <div
                  key={v.title}
                  className="shadow-soft rounded-2xl border border-gray-100 bg-white p-8 transition-shadow hover:shadow-lg"
                >
                  <div className="bg-brand-primary/10 mb-5 flex h-14 w-14 items-center justify-center rounded-xl">
                    <Icon size={28} className="text-brand-primary" />
                  </div>
                  <h3 className="font-display text-brand-primary mb-2 text-xl font-semibold">
                    {v.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600">{v.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Stats */}
        <section className="bg-brand-primary mt-16 rounded-3xl p-12 text-white">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-white mb-2 text-3xl font-bold md:text-4xl">
                  {s.value}
                </div>
                <div className="text-sm text-white/70">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
