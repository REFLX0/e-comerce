import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function HeroBanner() {
  return (
    <section className="relative bg-brand-primary-dark overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      </div>
      
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-brand-accent/20 rounded-full blur-3xl"></div>
      
      <div className="section-padding relative z-10 py-20 lg:py-32">
        <div className="max-w-2xl">
          <span className="inline-block py-1 px-3 rounded-full bg-brand-accent/10 text-brand-accent text-sm font-semibold mb-6 border border-brand-accent/20">
            Qualité Garantie
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight mb-6">
            L'Énergie qu'il faut à votre <span className="text-brand-accent">Moteur</span>
          </h1>
          <p className="text-lg text-gray-300 mb-10 max-w-xl leading-relaxed">
            Découvrez notre large gamme de lubrifiants et huiles moteur multimarques. 
            Protection optimale, performance maximale et longévité assurée pour votre véhicule.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/trouver-mon-huile" className="btn-primary text-center flex justify-center items-center gap-2">
              Trouver mon huile
              <ArrowRight size={20} />
            </Link>
            <Link href="/catalogue" className="border-2 border-white/20 text-white hover:bg-white/10 font-semibold rounded-full px-6 py-3 transition-all duration-200 text-center">
              Voir le catalogue
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
