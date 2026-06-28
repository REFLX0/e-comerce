import Link from 'next/link'
import { Tag } from 'lucide-react'

export function PromosBanner() {
  return (
    <section className="section-padding py-8">
      <div className="bg-brand-accent rounded-2xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 text-white shadow-card">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex items-center gap-6">
          <div className="hidden md:flex w-16 h-16 bg-white/20 rounded-full items-center justify-center shrink-0">
            <Tag size={32} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
              Offres Spéciales du Mois
            </h2>
            <p className="text-white/90 max-w-xl">
              Profitez de réductions allant jusqu'à -30% sur une sélection d'huiles synthétiques haut de gamme.
            </p>
          </div>
        </div>
        
        <div className="relative z-10 shrink-0 w-full md:w-auto">
          <Link 
            href="/promotions" 
            className="block w-full md:w-auto bg-white text-brand-accent hover:bg-brand-surface font-bold px-8 py-4 rounded-full text-center transition-colors shadow-sm hover:shadow"
          >
            Voir les Promotions
          </Link>
        </div>
      </div>
    </section>
  )
}
