import type { Metadata } from 'next'
import { Inter, Poppins, JetBrains_Mono } from 'next/font/google'
import '../globals.css'
import { Providers } from '@/components/Providers'
import { Toaster } from 'sonner'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { GridOverlayControls } from '@/components/layout/GridOverlayControls'

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

import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Index' })

  return {
    title: t('title'),
    description: t('description'),
    keywords: [
      'huile moteur',
      'lubrifiant',
      'Tunisie',
      'KiosqueTN',
      'huile synthétique',
      'vidange',
      'Total',
      'Shell',
      'Castrol',
      'Motul',
      'filtres auto',
    ],
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      locale: locale === 'fr' ? 'fr_TN' : 'en_US',
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

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${poppins.variable} ${jetbrainsMono.variable}`}
      style={{ scrollBehavior: 'smooth' }}
      suppressHydrationWarning
    >
      <body
        className="text-foreground bg-brand-surface flex min-h-screen flex-col font-sans"
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <Providers>
            {/* Skip link for keyboard / screen reader navigation */}
            <a
              href="#main-content"
              className="bg-brand-primary ring-brand-accent sr-only z-50 rounded-lg p-4 font-bold text-white ring-2 outline-none focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
            >
              Aller au contenu principal
            </a>

            {children}

            <Toaster position="bottom-right" richColors closeButton />
          </Providers>
        </NextIntlClientProvider>

        <GridOverlayControls />
      </body>
    </html>
  )
}
