import type { Metadata } from 'next'
import { Inter, Poppins, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Toaster } from 'sonner'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_SITE_NAME} | Lubrifiants et Huiles Moteur`,
  description: 'Le spécialiste de la vente de lubrifiants et huiles moteur en Tunisie.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${poppins.variable} ${jetbrainsMono.variable}`} style={{ scrollBehavior: 'smooth' }} suppressHydrationWarning>
      <body className="font-sans text-foreground bg-brand-surface min-h-screen flex flex-col" suppressHydrationWarning>
        <Providers>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-brand-primary text-white p-4 z-50 rounded-lg font-bold outline-none ring-2 ring-brand-accent">
            Aller au contenu principal
          </a>
          <Header />
          <main id="main-content" className="flex-1 flex flex-col focus:outline-none" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          <Toaster position="bottom-right" richColors />
        </Providers>
      </body>
    </html>
  )
}
