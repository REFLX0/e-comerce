import { Breadcrumb } from '@/components/common/Breadcrumb'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'Guides & Conseils Auto | specpart',
    description: 'Découvrez nos guides d\'experts et conseils d\'entretien automobile pour choisir les meilleures pièces détachées.',
    alternates: {
      canonical: `/${locale}/guides`,
      languages: {
        fr: `/fr/guides`,
        en: `/en/guides`,
        ar: `/ar/guides`,
      },
    },
  }
}

export default async function GuidesPage() {
  const tNav = await getTranslations('Nav')

  return (
    <div className="bg-brand-surface min-h-screen section-padding py-8">
      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Guides & Conseils' },
        ]}
      />
      
      <div className="mt-8">
        <h1 className="font-display text-[#111] text-3xl font-bold md:text-4xl">
          Guides & Conseils Auto
        </h1>
        <p className="mt-4 text-gray-600 max-w-2xl">
          Nos experts partagent leurs connaissances pour vous aider à entretenir votre véhicule et bien choisir vos pièces de rechange.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Placeholder for future blog posts/guides */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <span className="text-sm font-semibold text-brand-primary">Entretien</span>
            <h2 className="mt-2 text-xl font-bold text-gray-900">Quand changer ses disques de frein ?</h2>
            <p className="mt-3 text-gray-500 line-clamp-3">
              Le système de freinage est l'élément de sécurité le plus important de votre voiture. Découvrez les signes qui indiquent qu'il est temps de remplacer vos disques.
            </p>
            <a href="#" className="mt-4 inline-block font-semibold text-brand-primary hover:underline">Lire le guide &rarr;</a>
          </div>
          
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <span className="text-sm font-semibold text-brand-secondary">Huile Moteur</span>
            <h2 className="mt-2 text-xl font-bold text-gray-900">Différence entre l'huile 5W-30 et 5W-40</h2>
            <p className="mt-3 text-gray-500 line-clamp-3">
              Comprenez les indices de viscosité et choisissez l'huile moteur parfaitement adaptée au climat tunisien et à votre type de moteur.
            </p>
            <a href="#" className="mt-4 inline-block font-semibold text-brand-primary hover:underline">Lire le guide &rarr;</a>
          </div>
        </div>
      </div>
    </div>
  )
}
