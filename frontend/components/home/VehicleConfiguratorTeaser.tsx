import Link from 'next/link'
import { Car, Wrench, SearchCode } from 'lucide-react'

export function VehicleConfiguratorTeaser() {
  return (
    <section className="section-padding py-16">
      <div className="bg-brand-primary rounded-3xl overflow-hidden shadow-card relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary via-brand-primary/95 to-transparent"></div>
        
        <div className="relative z-10 p-8 md:p-16 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-white">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 leading-tight">
              Trouvez l'huile exacte pour <span className="text-brand-accent">votre véhicule</span>
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-xl">
              Utilisez notre configurateur intelligent. Entrez la marque, le modèle et l'année de votre voiture pour obtenir instantanément les recommandations des constructeurs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Car size={20} className="text-brand-accent" />
                </div>
                <span className="text-sm font-medium">Auto & Moto</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Wrench size={20} className="text-brand-accent" />
                </div>
                <span className="text-sm font-medium">Normes constructeurs</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <SearchCode size={20} className="text-brand-accent" />
                </div>
                <span className="text-sm font-medium">Recherche exacte</span>
              </div>
            </div>
            
            <Link 
              href="/trouver-mon-huile" 
              className="btn-primary inline-flex items-center gap-2"
            >
              Lancer la recherche
            </Link>
          </div>
          
          <div className="hidden lg:block w-1/3">
            {/* 3D or visual representation of the configurator */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="space-y-4">
                <div className="h-10 bg-white/20 rounded-lg"></div>
                <div className="h-10 bg-white/20 rounded-lg w-3/4"></div>
                <div className="h-10 bg-brand-accent rounded-lg w-1/2 mt-8"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
