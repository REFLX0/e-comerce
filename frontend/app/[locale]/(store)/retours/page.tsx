import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { useTranslations } from 'next-intl'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { PackageSearch, ShieldCheck, CalendarClock, Undo2, Banknote } from 'lucide-react'
import { Link } from '@/i18n/routing'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Returns' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default function RetoursPage() {
  const t = useTranslations('Returns')
  const conditions = t.raw('conditions') as string[]
  const steps = t.raw('steps') as Array<{ title: string; desc: string }>

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

        {/* Policy summary */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <CalendarClock className="mb-3 text-brand-primary" size={28} />
            <h2 className="text-brand-primary font-display mb-2 font-bold">{t('windowTitle')}</h2>
            <p className="text-sm leading-relaxed text-gray-600">{t('windowDesc')}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <ShieldCheck className="mb-3 text-brand-primary" size={28} />
            <h2 className="text-brand-primary font-display mb-2 font-bold">{t('eligibilityTitle')}</h2>
            <p className="text-sm leading-relaxed text-gray-600">{t('eligibilityDesc')}</p>
          </div>
        </div>

        {/* Conditions list */}
        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-brand-primary font-display mb-4 flex items-center gap-2 font-bold">
            <PackageSearch size={20} /> {t('conditionsTitle')}
          </h2>
          <ul className="space-y-2">
            {conditions.map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm leading-relaxed text-gray-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-primary" />
                {c}
              </li>
            ))}
          </ul>
        </div>

        {/* Process steps */}
        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-brand-primary font-display mb-6 flex items-center gap-2 font-bold">
            <Undo2 size={20} /> {t('stepsTitle')}
          </h2>
          <ol className="space-y-6">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-gray-800">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link
            href="/compte/support"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-light"
          >
            <Banknote size={16} /> {t('cta')}
          </Link>
        </div>
      </div>
    </>
  )
}