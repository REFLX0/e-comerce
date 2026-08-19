import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Legal' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default function MentionsLegalesPage() {
  const t = useTranslations('Legal')

  return (
    <>
      <section className="from-brand-primary to-brand-primary-dark bg-gradient-to-br py-16 text-white">
        <div className="section-padding text-center">
          <h1 className="font-display mb-4 text-4xl font-bold md:text-5xl">{t('title')}</h1>
          <p className="text-white/70">{t('subtitle')}</p>
        </div>
      </section>

      <div className="section-padding mx-auto max-w-4xl py-12">
        <Breadcrumb items={[{ label: t('breadcrumb') }]} />

        <div className="prose prose-lg mt-10 space-y-8 text-gray-600">
          <section>
            <h2 className="text-brand-primary font-display">{t('editor')}</h2>
            <p>
              <strong>specpart</strong>
              <br />
              {t('editorContent')}
              <br />
              {t('seat')}
              <br />
              {t('phone')}
              <br />
              {t('email')}
              <br />
              {t('rcLabel')} {t('rcValue')}
              <br />
              {t('mfLabel')} {t('mfValue')}
            </p>
          </section>

          <section>
            <h2 className="text-brand-primary font-display">{t('director')}</h2>
            <p>{t('directorContent')}</p>
          </section>

          <section>
            <h2 className="text-brand-primary font-display">{t('hosting')}</h2>
            <p>
              {t.rich('hostingContent', {
                strong: (chunks) => <strong>{chunks}</strong>,
                br: () => <br />,
              })}
            </p>
          </section>

          <section>
            <h2 className="text-brand-primary font-display">{t('intellectual')}</h2>
            <p>{t('intellectualContent1')}</p>
            <p>{t('intellectualContent2')}</p>
          </section>

          <section>
            <h2 className="text-brand-primary font-display">{t('personalData')}</h2>
            <p>{t('personalDataContent1')}</p>
            <p>{t('personalDataContent2')}</p>
          </section>

          <section>
            <h2 className="text-brand-primary font-display">{t('cookies')}</h2>
            <p>{t('cookiesContent')}</p>
          </section>

          <section>
            <h2 className="text-brand-primary font-display">{t('limitation')}</h2>
            <p>{t('limitationContent')}</p>
          </section>
        </div>
      </div>
    </>
  )
}