import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const locales = ['fr', 'en', 'ar']
const ITEMS_PER_SITEMAP = 10000

export async function generateSitemaps() {
  try {
    const totalProducts = await db.product.count({ where: { isPublished: true } })
    const totalPages = Math.ceil(totalProducts / ITEMS_PER_SITEMAP)

    // id 0 is for core pages and categories. id 1+ are for product chunks.
    const sitemaps = [{ id: 0 }]
    for (let i = 0; i < totalPages; i++) {
      sitemaps.push({ id: i + 1 })
    }
    return sitemaps
  } catch {
    // DB unavailable at build time (e.g. Docker build without a live DB).
    // Return a single sitemap ID so the build doesn't fail. The actual sitemap
    // will be generated correctly at runtime when the DB is reachable.
    return [{ id: 0 }]
  }
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://specpart.tech'
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

  try {
    if (id === 0) {
      // Static pages
      addEntry('', 1.0, 'daily')
      addEntry('/catalogue', 0.9, 'daily')
      addEntry('/a-propos', 0.5, 'monthly')
      addEntry('/contact', 0.5, 'monthly')
      addEntry('/faq', 0.5, 'monthly')
      addEntry('/cgv', 0.3, 'monthly')

      // Categories
      const categories = await db.category.findMany({ select: { slug: true } })
      for (const cat of categories) {
        addEntry(`/categorie/${cat.slug}`, 0.8, 'weekly')
      }
    } else {
      // Products
      const pageIndex = id - 1
      const products = await db.product.findMany({
        where: { isPublished: true },
        select: { slug: true, createdAt: true },
        skip: pageIndex * ITEMS_PER_SITEMAP,
        take: ITEMS_PER_SITEMAP,
      })

      for (const product of products) {
        addEntry(`/produit/${product.slug}`, 0.8, 'weekly', product.createdAt)
      }
    }
  } catch {
    // DB unavailable at build time — return an empty but valid sitemap
  }

  return sitemapEntries
}
