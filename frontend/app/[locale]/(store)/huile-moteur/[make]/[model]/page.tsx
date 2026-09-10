import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { FAQSchema } from '@/components/common/FAQSchema'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { Droplets, Gauge, Fuel, ChevronRight, ShoppingCart } from 'lucide-react'

interface Props {
  params: Promise<{ make: string; model: string; locale: string }>
}

// ─── Static Generation ───────────────────────────────────────────────────────
// Called at build time. Only generate pages for the top 200 makes×models
// to keep build times short. The rest will be generated on-demand (ISR).
export async function generateStaticParams() {
  try {
    const models = await db.vehicleModel.findMany({
      take: 200,
      select: {
        slug: true,
        make: { select: { slug: true } },
      },
    })
    return models.map((m) => ({ make: m.make.slug, model: m.slug }))
  } catch {
    return []
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { make, model, locale } = await params
  const makeName = make.charAt(0).toUpperCase() + make.slice(1).replace(/-/g, ' ')
  const modelName = model.replace(/-/g, ' ').toUpperCase()

  const title = `Huile moteur ${makeName} ${modelName} — Recommandation OEM | specpart`
  const description = `Trouvez la meilleure huile moteur pour votre ${makeName} ${modelName}. Viscosité, approbation OEM, capacité et prix en Tunisie. Livraison rapide.`

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/huile-moteur/${make}/${model}`,
      languages: {
        fr: `/fr/huile-moteur/${make}/${model}`,
        ar: `/ar/huile-moteur/${make}/${model}`,
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function HuileMoteurModelPage({ params }: Props) {
  const { make, model, locale } = await params

  // Load vehicle data from DB
  const vehicleModel = await db.vehicleModel.findFirst({
    where: { slug: model },
    include: {
      make: true,
      generations: {
        orderBy: { yearFrom: 'asc' },
        include: {
          engines: {
            include: { oilSpec: true },
          },
        },
      },
    },
  }).catch(() => null)

  if (!vehicleModel) notFound()

  const makeName = vehicleModel.make.name
  const modelName = vehicleModel.name

  // Collect all unique oil specs across all engines of this model
  const oilSpecs = vehicleModel.generations.flatMap(g =>
    g.engines.filter(e => e.oilSpec).map(e => ({ engine: e, generation: g, spec: e.oilSpec! }))
  )

  // Build distinct specs (deduplicate by viscosity + OEM approval)
  const distinctSpecs = Array.from(
    new Map(oilSpecs.map(s => [`${s.spec.viscosity}-${s.spec.oemApproval}`, s])).values()
  )

  const faqs = [
    {
      question: `Quelle huile moteur pour ${makeName} ${modelName} ?`,
      answer: distinctSpecs.length > 0
        ? `La ${makeName} ${modelName} nécessite une huile ${distinctSpecs[0].spec.viscosity} avec approbation ${distinctSpecs[0].spec.oemApproval ?? distinctSpecs[0].spec.aceaStandard}. Vérifiez votre version précise pour confirmer la spécification exacte.`
        : `Consultez le guide du propriétaire de votre ${makeName} ${modelName} ou utilisez notre sélecteur de véhicule pour obtenir la recommandation exacte.`,
    },
    {
      question: `Quelle quantité d'huile pour ${makeName} ${modelName} ?`,
      answer: distinctSpecs.length > 0 && distinctSpecs[0].spec.capacityLiters
        ? `En général, le moteur de la ${makeName} ${modelName} nécessite environ ${distinctSpecs[0].spec.capacityLiters} litres d'huile lors d'une vidange complète (filtre inclus).`
        : `La capacité d'huile varie selon la motorisation de votre ${makeName} ${modelName}. Référez-vous à votre manuel ou contactez-nous.`,
    },
    {
      question: `Combien coûte une vidange ${makeName} ${modelName} en Tunisie ?`,
      answer: `Le prix d'une vidange pour ${makeName} ${modelName} en Tunisie varie entre 60 et 150 TND selon la qualité de l'huile choisie. Commandez votre huile sur specpart.tn et économisez sur la pièce.`,
    },
  ]

  return (
    <div className="bg-brand-surface min-h-screen section-padding py-8">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AutoPartsStore',
            name: 'specpart',
            url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://specpart.tech'}/${locale}/huile-moteur/${make}/${model}`,
          }),
        }}
      />
      <FAQSchema faqs={faqs} />

      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Huile Moteur par Véhicule', href: '/huile-moteur' },
          { label: makeName, href: `/huile-moteur/${make}` },
          { label: modelName },
        ]}
      />

      {/* Hero */}
      <div className="mt-6 rounded-2xl bg-gradient-to-br from-[#16254c] to-[#223b76] p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <Droplets size={28} className="text-[#D4A76A]" />
          <h1 className="text-3xl font-bold">
            Huile Moteur {makeName} {modelName}
          </h1>
        </div>
        <p className="text-white/70 max-w-2xl">
          Recommandations d'huile moteur officielles pour toutes les versions de la {makeName} {modelName}. Spécifications OEM, viscosité et capacité pour chaque motorisation.
        </p>
        <Link
          href={`/${locale}/catalogue?make=${make}&model=${model}&categorySlug=huile-moteur`}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#D4A76A] px-6 py-3 font-bold text-[#0d162d] hover:bg-[#c49558] transition-colors"
        >
          <ShoppingCart size={18} />
          Voir les huiles compatibles
        </Link>
      </div>

      {/* Engine Specs Grid */}
      {vehicleModel.generations.length > 0 ? (
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-[#111] mb-6">
            Spécifications par génération
          </h2>
          <div className="space-y-6">
            {vehicleModel.generations.map((gen) => (
              <div key={gen.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-[#16254c] mb-1">
                  {modelName} {gen.name}
                </h3>
                {(gen.yearFrom || gen.yearTo) && (
                  <p className="text-sm text-slate-500 mb-4">
                    {gen.yearFrom ?? '?'} — {gen.yearTo ?? 'Actuel'}
                  </p>
                )}
                {gen.engines.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="text-left py-2 pr-4 font-semibold text-slate-600">Moteur</th>
                          <th className="text-left py-2 pr-4 font-semibold text-slate-600">
                            <Fuel size={14} className="inline mr-1" />Carburant
                          </th>
                          <th className="text-left py-2 pr-4 font-semibold text-slate-600">
                            <Gauge size={14} className="inline mr-1" />Puissance
                          </th>
                          <th className="text-left py-2 pr-4 font-semibold text-slate-600">
                            <Droplets size={14} className="inline mr-1" />Viscosité
                          </th>
                          <th className="text-left py-2 font-semibold text-slate-600">Approbation OEM</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gen.engines.map((engine) => (
                          <tr key={engine.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                            <td className="py-3 pr-4 font-medium text-[#16254c]">{engine.name}</td>
                            <td className="py-3 pr-4 text-slate-600 capitalize">{engine.fuelType}</td>
                            <td className="py-3 pr-4 text-slate-600">
                              {engine.powerHp ? `${Math.round(engine.powerHp)} ch` : '—'}
                            </td>
                            <td className="py-3 pr-4">
                              {engine.oilSpec ? (
                                <span className="inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                                  {engine.oilSpec.viscosity}
                                </span>
                              ) : '—'}
                            </td>
                            <td className="py-3">
                              {engine.oilSpec?.oemApproval ? (
                                <span className="text-xs text-emerald-700 font-medium">{engine.oilSpec.oemApproval}</span>
                              ) : engine.oilSpec?.aceaStandard ? (
                                <span className="text-xs text-slate-500">ACEA {engine.oilSpec.aceaStandard}</span>
                              ) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm italic">Données moteur non disponibles pour cette génération.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* CTA Section */}
      <div className="mt-10 rounded-2xl border border-[#D4A76A]/30 bg-[#D4A76A]/5 p-8 text-center">
        <h2 className="text-xl font-bold text-[#16254c] mb-2">
          Commandez votre huile moteur pour {makeName} {modelName}
        </h2>
        <p className="text-slate-600 mb-6 max-w-xl mx-auto">
          Livraison partout en Tunisie · Paiement à la livraison · Huiles certifiées
        </p>
        <Link
          href={`/${locale}/catalogue?make=${make}&model=${model}`}
          className="inline-flex items-center gap-2 rounded-xl bg-[#16254c] px-8 py-4 font-bold text-white hover:bg-[#223b76] transition-colors"
        >
          Voir les produits compatibles
          <ChevronRight size={18} />
        </Link>
      </div>

      {/* FAQ Section (visible to users AND crawlers) */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-[#111] mb-6">Questions fréquentes</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <summary className="cursor-pointer font-semibold text-[#16254c] list-none flex items-center justify-between">
                {faq.question}
                <ChevronRight size={16} className="shrink-0 text-slate-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="mt-3 text-slate-600 leading-relaxed">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  )
}

// ISR: regenerate this page every 24h so new oil data is always fresh
export const revalidate = 86400
