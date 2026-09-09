import type { Metadata } from 'next'
import { Inter, Poppins, JetBrains_Mono, Cairo } from 'next/font/google'
import '../globals.css'
import { Providers } from '@/components/Providers'
import 'goey-toast/styles.css'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

// Cairo — Arabic Latin-script fallback. Loaded globally so that locale='ar'
// can render Arabic glyphs without an extra network round-trip on switch.
// `swap` display avoids blocking first paint for LTR users.
const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
})

import { getTranslations } from 'next-intl/server'

const LOCALE_TO_OG: Record<string, string> = {
  fr: 'fr_TN',
  en: 'en_US',
  ar: 'ar_TN',
}

const LOCALE_KEYWORDS: Record<string, string[]> = {
  fr: ['huile moteur', 'lubrifiant', 'Tunisie', 'specpart', 'huile synthétique', 'vidange', 'Total', 'Shell', 'Castrol', 'Motul', 'filtres auto'],
  en: ['engine oil', 'lubricant', 'Tunisia', 'specpart', 'synthetic oil', 'oil change', 'Total', 'Shell', 'Castrol', 'Motul', 'auto filters'],
  ar: ['زيت محرك', 'زيوت محرك', 'تونس', 'specpart', 'زيت صناعي', 'تغيير الزيت', 'توتال', 'شل', 'كاسترول', 'موتول', 'فلاتر سيارات'],
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Index' })

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://specpart.tech'

  return {
    metadataBase: new URL(siteUrl),
    title: t('title'),
    description: t('description'),
    keywords: LOCALE_KEYWORDS[locale] ?? LOCALE_KEYWORDS.fr,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        fr: '/fr',
        en: '/en',
        ar: '/ar',
        'x-default': '/fr',
      },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `/${locale}`,
      siteName: 'specpart',
      type: 'website',
      locale: LOCALE_TO_OG[locale] ?? LOCALE_TO_OG.fr,
    },
  }
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {

  const { locale } = await params
  const messages = await getMessages()
  const tLayout = await getTranslations({ locale, namespace: 'Layout' })

  // RTL for Arabic — applied at the <html> root so the whole document flips.
  // Tailwind v4 logical properties (ms-*, me-*, ps-*, pe-*, start-*, end-*,
  // border-s-*, border-e-*) read this attribute and mirror automatically.
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${inter.variable} ${poppins.variable} ${jetbrainsMono.variable} ${cairo.variable}`}
      data-scroll-behavior="smooth"
      style={{ scrollBehavior: 'smooth' }}
      suppressHydrationWarning
    >
      <body
        className={`text-foreground bg-brand-surface flex min-h-screen flex-col font-sans ${locale === 'ar' ? 'font-arabic' : ''}`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <a
              href="#main-content"
              className="bg-brand-primary ring-white sr-only z-50 rounded-lg p-4 font-bold text-white ring-2 outline-none focus:not-sr-only focus:absolute focus:top-4 focus:start-4"
            >
              {tLayout('skipToContent')}
            </a>

            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@graph': [
                    {
                      '@type': 'WebSite',
                      '@id': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://specpart.tech'}/#website`,
                      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://specpart.tech',
                      name: 'specpart',
                      description: tLayout('description') || 'specpart',
                      inLanguage: locale,
                      publisher: { '@id': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://specpart.tech'}/#organization` },
                      potentialAction: {
                        '@type': 'SearchAction',
                        target: {
                          '@type': 'EntryPoint',
                          urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://specpart.tech'}/${locale}/catalogue?search={search_term_string}`,
                        },
                        'query-input': 'required name=search_term_string',
                      },
                    },
                    {
                      // AutoPartsStore (a LocalBusiness/AutomotiveBusiness subtype) rather than
                      // a generic Organization — tells Google this is a physical, local store
                      // serving Tunisia, which is what local-pack / "near me" ranking keys off.
                      '@type': 'AutoPartsStore',
                      '@id': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://specpart.tech'}/#organization`,
                      name: 'specpart',
                      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://specpart.tech',
                      logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://specpart.tech'}/icon.jpg`,
                      image: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://specpart.tech'}/icon.jpg`,
                      // TODO: add `sameAs: [...]` once the real Facebook/Instagram URLs are in —
                      // the footer's current links aren't the real accounts (per user), and wrong
                      // sameAs entries actively hurt entity verification, so omit until correct.
                      areaServed: {
                        '@type': 'Country',
                        name: 'Tunisia',
                      },
                      contactPoint: {
                        '@type': 'ContactPoint',
                        telephone: '+21629294195',
                        contactType: 'customer service',
                        email: 'specpart@hotmail.com',
                        areaServed: 'TN',
                        availableLanguage: ['fr', 'ar', 'en'],
                      },
                      address: {
                        '@type': 'PostalAddress',
                        streetAddress: '03, rue Mohamed Bayram 5, Sidi Daoud',
                        addressLocality: 'La Marsa',
                        postalCode: '2046',
                        addressCountry: 'TN',
                      },
                      openingHoursSpecification: {
                        '@type': 'OpeningHoursSpecification',
                        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                        opens: '08:00',
                        closes: '18:00',
                      },
                    },
                  ],
                }),
              }}
            />

            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
