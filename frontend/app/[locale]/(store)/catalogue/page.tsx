import CataloguePage from './client-page';
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Nav' })
  
  return {
    title: `${t('catalog')} | specpart`,
    alternates: {
      canonical: `/${locale}/catalogue`,
      languages: {
        fr: `/fr/catalogue`,
        en: `/en/catalogue`,
        ar: `/ar/catalogue`,
      },
    },
  }
}

export default function Page() { return <CataloguePage />; }
