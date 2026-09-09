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
    const description =
      category.description?.substring(0, 160) ||
      t('categoryMetaDescription', { name: category.name })
    return {
      title: `${category.name} | specpart`,
      description,
      // Always canonicalize to the bare category URL regardless of which
      // filter/sort/page query string was actually crawled — the page
      // supports many combinable query params (type, sortBy, brands, page,
      // viscosity, vehicle filters...) with none of them changing this
      // metadata, so without this every combination indexes as separate,
      // identical-looking duplicate content competing with the real page.
      alternates: {
        canonical: `/${locale}/categorie/${slug}`,
        languages: {
          fr: `/fr/categorie/${slug}`,
          en: `/en/categorie/${slug}`,
          ar: `/ar/categorie/${slug}`,
        },
      },
      openGraph: {
        title: category.name,
        description,
        type: 'website',
        ...(category.image ? { images: [{ url: category.image }] } : {}),
      },
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