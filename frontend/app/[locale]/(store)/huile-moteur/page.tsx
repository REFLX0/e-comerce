import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { Droplets, ChevronRight } from 'lucide-react'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'Huile Moteur par Marque et Modèle — Guide Complet | specpart',
    description: 'Trouvez la bonne huile moteur pour votre voiture en Tunisie. Sélectionnez votre marque : Peugeot, Renault, Volkswagen, Toyota et plus. Recommandations OEM officielles.',
    alternates: {
      canonical: `/${locale}/huile-moteur`,
      languages: {
        fr: `/fr/huile-moteur`,
        ar: `/ar/huile-moteur`,
      },
    },
  }
}

export default async function HuileMoteurIndexPage({ params }: Props) {
  const { locale } = await params

  const makes = await db.vehicleMake.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { models: true } },
    },
  }).catch(() => [])

  return (
    <div className="bg-brand-surface min-h-screen section-padding py-8">
      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Huile Moteur par Véhicule' },
        ]}
      />

      <div className="mt-6">
        <div className="flex items-center gap-3 mb-2">
          <Droplets size={28} className="text-[#16254c]" />
          <h1 className="text-3xl font-bold text-[#111]">
            Huile Moteur par Marque
          </h1>
        </div>
        <p className="text-slate-600 max-w-2xl">
          Sélectionnez la marque de votre véhicule pour obtenir la recommandation d'huile moteur exacte — viscosité, approbation OEM et produits disponibles en Tunisie.
        </p>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {makes.map((make) => (
          <Link
            key={make.id}
            href={`/${locale}/huile-moteur/${make.slug}`}
            className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-[#16254c] hover:shadow-md transition-all"
          >
            <div>
              <p className="font-bold text-[#111] group-hover:text-[#16254c] transition-colors">
                {make.name}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {make._count.models} modèle{make._count.models > 1 ? 's' : ''}
              </p>
            </div>
            <ChevronRight size={16} className="shrink-0 text-slate-300 group-hover:text-[#16254c] transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  )
}

export const revalidate = 86400
