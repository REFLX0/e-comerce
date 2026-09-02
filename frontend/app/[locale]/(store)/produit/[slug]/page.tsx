import { productsApi } from '@/lib/api/products'
import { ProductPageClient } from './ProductPageClient'
import { ProductTabs } from '@/components/product/ProductTabs'
import { RelatedProducts } from '@/components/product/RelatedProducts'
import { StickyMobileCartWrapper } from '@/components/product/StickyMobileCartWrapper'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

interface Props {
  params: Promise<{ slug: string; locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params
  try {
    const product = await productsApi.getBySlug(slug)
    const description = product.shortDescription || product.description?.substring(0, 160)
    return {
      title: `${product.name} | specpart`,
      description,
      alternates: {
        canonical: `/${locale}/produit/${slug}`,
        languages: {
          fr: `/fr/produit/${slug}`,
          en: `/en/produit/${slug}`,
        },
      },
      openGraph: {
        title: product.name,
        description,
        type: 'website',
        ...(product.images?.[0] ? { images: [{ url: product.images[0] }] } : {}),
      },
    }
  } catch {
    const t = await getTranslations({ locale, namespace: 'Product' })
    return {
      title: `${t('notFound')} | specpart`,
    }
  }
}

export default async function ProductPage({ params }: Props) {
  const tNav = await getTranslations('Nav')
  let product;
  try {
    const { slug } = await params
    product = await productsApi.getBySlug(slug)
  } catch {
    notFound()
  }

  if (!product) {
    notFound()
  }

  return (
    <div className="bg-brand-surface min-h-screen">
      <div className="section-padding py-4">
        <Breadcrumb
          items={[
            { label: tNav('catalog'), href: '/catalogue' },
            ...(product.category
              ? [{ label: product.category.name, href: `/categorie/${product.category.slug}` }]
              : []),
            { label: product.name },
          ]}
        />

        <div className="border-brand-surface-dark mt-4 rounded-3xl border bg-white p-4 md:p-6 shadow-card animate-fade-in-up">
          <ProductPageClient product={product} />
        </div>

        <ProductTabs product={product} />

        <RelatedProducts productId={product.id} />
      </div>

      {/* Sticky Mobile Add to Cart */}
      <StickyMobileCartWrapper product={product} />
    </div>
  )
}
