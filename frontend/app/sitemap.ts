import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const locales = ['fr', 'en', 'ar']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://specpart.tech'

  // Fetch all active products
  const products = await db.product.findMany({
    where: { isPublished: true },
    select: { slug: true, createdAt: true },
  })

  const categories = await db.category.findMany({
    select: { slug: true },
  })

  const sitemapEntries: MetadataRoute.Sitemap = []

  const addEntry = (path: string, priority: number, changeFrequency: 'daily' | 'weekly' | 'monthly' = 'weekly', lastModified: Date = new Date()) => {
    const alternates = {
      languages: Object.fromEntries(
        locales.map((l) => [l, `${baseUrl}/${l}${path}`])
      ),
    }

    locales.forEach((locale) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${path}`,
        lastModified,
        changeFrequency,
        priority,
        alternates,
      })
    })
  }

  // Static pages
  addEntry('', 1.0, 'daily')
  addEntry('/catalogue', 0.9, 'daily')
  addEntry('/a-propos', 0.5, 'monthly')
  addEntry('/contact', 0.5, 'monthly')
  addEntry('/faq', 0.5, 'monthly')
  addEntry('/cgv', 0.3, 'monthly')

  // Categories
  for (const cat of categories) {
    addEntry(`/categorie/${cat.slug}`, 0.8, 'weekly')
  }

  // Products
  for (const product of products) {
    addEntry(`/produit/${product.slug}`, 0.8, 'weekly', product.createdAt)
  }

  return sitemapEntries
}
