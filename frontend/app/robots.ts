import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.KiosqueTN.tn'
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/compte', '/api'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

