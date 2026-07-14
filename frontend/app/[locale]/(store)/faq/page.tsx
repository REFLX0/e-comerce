import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { HelpCircle } from 'lucide-react'
import FaqItem from '@/components/faq/FaqItem'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Faq' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default function FaqPage() {
  const t = useTranslations('Faq')
  const sections = t.raw('sections') as Array<{category: string, items: {q: string, a: string}[]}>

  return (
    <>
      {/* Hero */}
      <section className="from-brand-primary to-brand-primary-dark bg-gradient-to-br py-16 text-white md:py-24">
        <div className="section-padding text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
            <HelpCircle size={18} />
            <span className="text-sm font-medium">{t('helpCenter')}</span>
          </div>
          <h1 className="font-display mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
            {t('title')}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/80">
            {t('subtitle')}
          </p>
        </div>
      </section>

      <div className="section-padding py-12">
        <Breadcrumb items={[{ label: t('breadcrumb') }]} />

        <div className="mx-auto mt-10 max-w-3xl space-y-10">
          {sections.map((section) => (
            <div key={section.category}>
              <h2 className="font-display text-brand-primary mb-4 text-xl font-semibold">
                {section.category}
              </h2>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <FaqItem key={item.q} question={item.q} answer={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
