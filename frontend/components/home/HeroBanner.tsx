import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function HeroBanner() {
  const categories = [
    { name: "Automobile", url: "/categorie/automobile", imageClass: "bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=800&auto=format&fit=crop')]" },
    { name: "Moto / Quad / Karting", url: "/categorie/moto-quad-karting", imageClass: "bg-[url('https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800&auto=format&fit=crop')]" },
    { name: "Transport / T.P.", url: "/categorie/transport-tp", imageClass: "bg-[url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=800&auto=format&fit=crop')]" },
    { name: "Agriculture / Motoculture", url: "/categorie/agriculture-motoculture", imageClass: "bg-[url('https://images.unsplash.com/photo-1592982537447-6f2334208f26?q=80&w=800&auto=format&fit=crop')]" },
    { name: "Industrie et spécialités", url: "/categorie/industrie-specialites", imageClass: "bg-[url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop')]" },
    { name: "Marine nautisme", url: "/categorie/marine-nautisme", imageClass: "bg-[url('https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?q=80&w=800&auto=format&fit=crop')]" }
  ]

  return (
    <section className="bg-brand-surface py-8">
      <div className="section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Main Hero (Automobile) takes 2 columns on lg */}
          <Link href={categories[0].url} className={`group relative h-80 lg:col-span-2 rounded-2xl overflow-hidden ${categories[0].imageClass} bg-cover bg-center`}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity group-hover:opacity-90"></div>
            <div className="absolute bottom-0 left-0 p-8 w-full">
              <span className="inline-block py-1 px-3 rounded-full bg-brand-accent text-white text-xs font-bold tracking-wider uppercase mb-3">
                Top Vente
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-2 group-hover:text-brand-accent transition-colors">
                {categories[0].name}
              </h2>
              <p className="text-gray-200 mb-4 max-w-md hidden sm:block">
                Toutes les huiles moteur, huiles de boîte et liquides de refroidissement pour votre voiture.
              </p>
              <div className="inline-flex items-center gap-2 text-white font-medium group-hover:gap-3 transition-all">
                Découvrir <ArrowRight size={18} />
              </div>
            </div>
          </Link>

          {/* Other Categories */}
          {categories.slice(1).map((cat, idx) => (
            <Link key={cat.name} href={cat.url} className={`group relative h-80 rounded-2xl overflow-hidden ${cat.imageClass} bg-cover bg-center`}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity group-hover:opacity-90"></div>
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <h3 className="text-xl font-display font-bold text-white mb-2 group-hover:text-brand-accent transition-colors leading-tight">
                  {cat.name}
                </h3>
                <div className="inline-flex items-center gap-2 text-brand-accent font-medium group-hover:gap-3 transition-all text-sm">
                  Voir la gamme <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
