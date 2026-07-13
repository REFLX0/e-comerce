import { useTranslations } from 'next-intl'
import { Breadcrumb } from '@/components/common/Breadcrumb'

export const metadata = {
  title: 'Conditions Générales de Vente | KiosqueTN',
  description: 'Consultez les conditions générales de vente de KiosqueTN.',
}

export default function CgvPage() {
  const t = useTranslations('Cgv')
  const articles = t.raw('articles') as Array<{title: string, content: string}>

  return (
    <>
      <section className="from-brand-primary to-brand-primary-dark bg-gradient-to-br py-16 text-white">
        <div className="section-padding text-center">
          <h1 className="font-display mb-4 text-4xl font-bold md:text-5xl">
            {t('title')}
          </h1>
          <p className="text-white/70">{t('date')}</p>
        </div>
      </section>

      <div className="section-padding mx-auto max-w-4xl py-12">
        <Breadcrumb items={[{ label: t('breadcrumb') }]} />

        <div className="prose prose-lg mt-10 space-y-8 text-gray-600">
          {articles.map((article, idx) => (
            <section key={idx}>
              <h2 className="text-brand-primary font-display">{article.title}</h2>
              <p>{article.content}</p>
            </section>
          ))}
        </div>
      </div>
    </>
  )
}
