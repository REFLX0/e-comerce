import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { Droplets, ChevronRight, Car } from 'lucide-react'

interface Props {
  params: Promise<{ make: string; locale: string }>
}

export async function generateStaticParams() {
  try {
    const makes = await db.vehicleMake.findMany({ select: { slug: true } })
    return makes.map((m) => ({ make: m.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { make, locale } = await params
  const makeName = make.charAt(0).toUpperCase() + make.slice(1).replace(/-/g, ' ')

  return {
    title: `Huile moteur ${makeName} — Tous les modèles | specpart`,
    description: `Trouvez la bonne huile moteur pour votre ${makeName}. Guide complet par modèle, viscosité OEM et achat en ligne en Tunisie.`,
    alternates: {
      canonical: `/${locale}/huile-moteur/${make}`,
      languages: {
        fr: `/fr/huile-moteur/${make}`,
        ar: `/ar/huile-moteur/${make}`,
      },
    },
  }
}

export default async function HuileMoteurMakePage({ params }: Props) {
  const { make, locale } = await params

  const vehicleMake = await db.vehicleMake.findFirst({
    where: { slug: make },
    include: {
      models: {
        orderBy: { name: 'asc' },
        select: { id: true, name: true, slug: true, vehicleType: true },
      },
    },
  }).catch(() => null)

  if (!vehicleMake) notFound()

  const makeName = vehicleMake.name

  return (
    <div className="bg-brand-surface min-h-screen section-padding py-8">
      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Huile Moteur par Véhicule', href: '/huile-moteur' },
          { label: makeName },
        ]}
      />

      <div className="mt-6">
        <div className="flex items-center gap-3 mb-2">
          <Droplets size={28} className="text-[#16254c]" />
          <h1 className="text-3xl font-bold text-[#111]">
            Huile Moteur {makeName}
          </h1>
        </div>
        <p className="text-slate-600 max-w-2xl">
          Sélectionnez votre modèle {makeName} pour obtenir la recommandation d'huile moteur exacte avec viscosité et approbation OEM.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {vehicleMake.models.map((model) => (
          <Link
            key={model.id}
            href={`/${locale}/huile-moteur/${make}/${model.slug}`}
            className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-[#16254c] hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 group-hover:bg-[#16254c]/10 group-hover:text-[#16254c] transition-colors">
                <Car size={18} />
              </div>
              <span className="font-semibold text-[#111] group-hover:text-[#16254c] transition-colors">
                {model.name}
              </span>
            </div>
            <ChevronRight size={16} className="shrink-0 text-slate-300 group-hover:text-[#16254c] transition-colors" />
          </Link>
        ))}
      </div>

      {vehicleMake.models.length === 0 && (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
          Aucun modèle disponible pour {makeName} pour le moment.
        </div>
      )}
    </div>
  )
}

export const revalidate = 86400
