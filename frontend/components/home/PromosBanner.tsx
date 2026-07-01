import Link from 'next/link'
import { Tag } from 'lucide-react'

export function PromosBanner() {
  return (
    <section className="section-padding py-8">
      <div className="bg-brand-accent shadow-card relative flex flex-col items-center justify-between gap-8 overflow-hidden rounded-2xl p-8 text-white md:flex-row md:p-12">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white opacity-10 blur-2xl"></div>
        <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-white opacity-10 blur-2xl"></div>

        <div className="relative z-10 flex items-center gap-6">
          <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/20 md:flex">
            <Tag size={32} className="text-white" />
          </div>
          <div>
            <h2 className="font-display mb-2 text-2xl font-bold md:text-3xl">
              Offres Spéciales du Mois
            </h2>
            <p className="max-w-xl text-white/90">
              Profitez de réductions allant jusqu'à -30% sur une sélection d'huiles synthétiques
              haut de gamme.
            </p>
          </div>
        </div>

        <div className="relative z-10 w-full shrink-0 md:w-auto">
          <Link
            href="/promotions"
            className="text-brand-accent hover:bg-brand-surface block w-full rounded-full bg-white px-8 py-4 text-center font-bold shadow-sm transition-colors hover:shadow md:w-auto"
          >
            Voir les Promotions
          </Link>
        </div>
      </div>
    </section>
  )
}
