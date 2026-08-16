import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const routing = defineRouting({
  // 'ar' is RTL — dir="rtl" is applied in app/[locale]/layout.tsx when locale === 'ar'.
  // All three locales share the same Latin/French slugs (e.g. /catalogue, /panier) —
  // only the displayed content and directionality change, not the URL structure.
  locales: ['fr', 'en', 'ar'],
  defaultLocale: 'fr',
  localePrefix: 'always'
})

// Lightweight wrappers around Next.js' navigation APIs
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
