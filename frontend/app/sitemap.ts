import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.KiosqueTN.tn'

  // Fetch all active products
  const products = await db.product.findMany({
    where: { isPublished: true },
    select: { slug: true, createdAt: true },
  })

  const productUrls = products.map((product: { slug: string; createdAt: Date }) => ({
    url: `${baseUrl}/produit/${product.slug}`,
    lastModified: product.createdAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/catalogue`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...productUrls,
  ]
}

