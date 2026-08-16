import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

// Can be imported from a shared config
// 'ar' uses dir="rtl" (applied in app/[locale]/layout.tsx); slugs are shared with fr/en.
export const locales = ['fr', 'en', 'ar']
export const defaultLocale = 'fr'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as any)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  }
})
