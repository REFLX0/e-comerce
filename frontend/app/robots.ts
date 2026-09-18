import { MetadataRoute } from 'next'

/**
 * Generated rather than served from public/robots.txt, which hardcoded the
 * sitemap URL to a single domain and listed only the /fr and /en variants of
 * the private routes - /ar/admin and /ar/auth were left crawlable even though
 * `ar` is a supported locale.
 */
const LOCALES = ['fr', 'en', 'ar']

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  ).replace(/\/$/, '')

  const privatePaths = LOCALES.flatMap((locale) => [
    `/${locale}/admin/`,
    `/${locale}/auth/`,
    `/${locale}/compte/`,
  ])

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          ...privatePaths,
          '/api/',
          '/_next/',
          // Faceted search params - not worth the crawl budget.
          '/*?*brand=',
          '/*?*price=',
          '/*?*sort=',
          '/*?*viscosity=',
          '/*?*oem=',
          '/*?*q=',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
