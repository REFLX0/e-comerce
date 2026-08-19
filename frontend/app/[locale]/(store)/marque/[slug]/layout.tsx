import { getTranslations } from 'next-intl/server'
import { brandsApi } from '@/lib/api/brands'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string; locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params
  const t = await getTranslations({ locale, namespace: 'Catalogue' })
  try {
    const brand = await brandsApi.getBySlug(slug)
    return {
      title: `${brand.name} | specpart`,
      description:
        brand.description?.substring(0, 160) ||
        t('brandMetaDescription', { name: brand.name }),
    }
  } catch {
    return {
      title: `${t('brandNotFound')} | specpart`,
    }
  }
}

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  return children
}
