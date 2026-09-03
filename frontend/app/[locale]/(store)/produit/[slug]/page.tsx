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
          ar: `/ar/produit/${slug}`,
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
  let slug;
  let locale;
  try {
    const resolvedParams = await params
    slug = resolvedParams.slug
    locale = resolvedParams.locale
    product = await productsApi.getBySlug(slug)
  } catch {
    notFound()
  }

  if (!product) {
    notFound()
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://specpart.tech'
  const productUrl = `${baseUrl}/${locale}/produit/${product.slug}`

  return (
    <div className="bg-brand-surface min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            image: product.images?.[0] ? [`${baseUrl}${product.images[0]}`] : [],
            description: product.description || product.shortDescription,
            sku: product.sku || product.reference || product.id,
            brand: {
              '@type': 'Brand',
              name: product.brand?.name || 'specpart',
            },
            offers: {
              '@type': 'Offer',
              url: productUrl,
              priceCurrency: 'TND',
              price: product.price,
              availability: (product.stock ?? 1) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: tNav('catalog'),
                item: `${baseUrl}/${locale}/catalogue`,
              },
              ...(product.category
                ? [
                    {
                      '@type': 'ListItem',
                      position: 2,
                      name: product.category.name,
                      item: `${baseUrl}/${locale}/categorie/${product.category.slug}`,
                    },
                  ]
                : []),
              {
                '@type': 'ListItem',
                position: product.category ? 3 : 2,
                name: product.name,
                item: productUrl,
              },
            ],
          }),
        }}
      />
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

        <div className="border-brand-surface-dark mt-3 rounded-2xl border bg-white p-3 md:p-4 shadow-card animate-fade-in-up">
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
