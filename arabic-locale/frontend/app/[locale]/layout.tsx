import type { Metadata } from 'next'
import { Inter, Poppins, JetBrains_Mono, Cairo } from 'next/font/google'
import '../globals.css'
import { Providers } from '@/components/Providers'
import { Toaster } from 'sonner'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  weight: ['400', '500', '600', '700', '800'],
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

  return {
    title: t('title'),
    description: t('description'),
    keywords: LOCALE_KEYWORDS[locale] ?? LOCALE_KEYWORDS.fr,
    openGraph: {
      title: t('title'),
      description: t('description'),
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

            {children}

            <Toaster position="bottom-right" richColors closeButton />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
