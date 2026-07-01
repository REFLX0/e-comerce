import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function HeroBanner() {
  const categories = [
    {
      name: 'Automobile',
      url: '/categorie/automobile',
      imageClass:
        "bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=800&auto=format&fit=crop')]",
    },
    {
      name: 'Moto / Quad / Karting',
      url: '/categorie/moto-quad-karting',
      imageClass:
        "bg-[url('https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800&auto=format&fit=crop')]",
    },
    {
      name: 'Transport / T.P.',
      url: '/categorie/transport-tp',
      imageClass:
        "bg-[url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=800&auto=format&fit=crop')]",
    },
    {
      name: 'Agriculture / Motoculture',
      url: '/categorie/agriculture-motoculture',
      imageClass:
        "bg-[url('https://images.unsplash.com/photo-1592982537447-6f2334208f26?q=80&w=800&auto=format&fit=crop')]",
    },
    {
      name: 'Industrie et spécialités',
      url: '/categorie/industrie-specialites',
      imageClass:
        "bg-[url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop')]",
    },
    {
      name: 'Marine nautisme',
      url: '/categorie/marine-nautisme',
      imageClass:
        "bg-[url('https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?q=80&w=800&auto=format&fit=crop')]",
    },
  ]

  return (
    <section className="bg-brand-surface pt-8 pb-32">
      <div className="section-padding">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Main Hero (Automobile) takes 2 columns on lg */}
          <Link
            href={categories[0]!.url}
            className={`group relative h-80 overflow-hidden rounded-2xl lg:col-span-2 ${categories[0]!.imageClass} bg-cover bg-center`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity group-hover:opacity-90"></div>
            <div className="absolute bottom-0 left-0 w-full p-8">
              <span className="bg-brand-accent mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wider text-white uppercase">
                Top Vente
              </span>
              <h2 className="font-display group-hover:text-brand-accent mb-2 text-3xl font-bold text-white transition-colors md:text-4xl">
                {categories[0]!.name}
              </h2>
              <p className="mb-4 hidden max-w-md text-gray-200 sm:block">
                Toutes les huiles moteur, huiles de boîte et liquides de refroidissement pour votre
                voiture.
              </p>
              <div className="inline-flex items-center gap-2 font-medium text-white transition-all group-hover:gap-3">
                Découvrir <ArrowRight size={18} />
              </div>
            </div>
          </Link>

          {/* Other Categories */}
          {categories.slice(1).map((cat, idx) => (
            <Link
              key={cat.name}
              href={cat.url}
              className={`group relative h-80 overflow-hidden rounded-2xl ${cat.imageClass} bg-cover bg-center`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity group-hover:opacity-90"></div>
              <div className="absolute bottom-0 left-0 w-full p-6">
                <h3 className="font-display group-hover:text-brand-accent mb-2 text-xl leading-tight font-bold text-white transition-colors">
                  {cat.name}
                </h3>
                <div className="text-brand-accent inline-flex items-center gap-2 text-sm font-medium transition-all group-hover:gap-3">
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
