import { getTranslations } from 'next-intl/server'
import { categoriesApi } from '@/lib/api/categories'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string; locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params
  const t = await getTranslations({ locale, namespace: 'Catalogue' })
  try {
    const category = await categoriesApi.getBySlug(slug)
    return {
      title: `${category.name} | specpart`,
      description:
        category.description?.substring(0, 160) ||
        t('categoryMetaDescription', { name: category.name }),
    }
  } catch {
    return {
      title: `${t('categoryNotFound')} | specpart`,
    }
  }
}

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return children
}