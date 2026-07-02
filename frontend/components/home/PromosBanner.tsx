import { Link } from '@/i18n/routing'
import { Tag } from 'lucide-react'

export function PromosBanner() {
  return (
    <section className="section-padding bg-brand-card py-10">
      <div className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-lg border border-brand-border bg-brand-primary p-6 text-white shadow-card md:flex-row md:items-center md:p-10">
        <div className="relative z-10 flex items-center gap-6">
          <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white/10 md:flex">
            <Tag size={28} className="text-brand-accent" />
          </div>
          <div>
            <h2 className="font-display mb-2 text-2xl font-bold md:text-3xl">
              Offres Spéciales du Mois
            </h2>
            <p className="max-w-xl text-white/72">
              Profitez de réductions allant jusqu'à -30% sur une sélection d'huiles synthétiques
              haut de gamme.
            </p>
          </div>
        </div>

        <div className="relative z-10 w-full shrink-0 md:w-auto">
          <Link
            href="/promotions"
            className="block min-h-11 w-full rounded-lg bg-white px-6 py-3 text-center font-bold text-brand-primary shadow-sm transition-all duration-200 hover:bg-brand-accent hover:shadow-card md:w-auto"
          >
            Voir les Promotions
          </Link>
        </div>
      </div>
    </section>
  )
}
