import { Link } from '@/i18n/routing'
import { ArrowRight, Car, Bike, Truck, Tractor, Factory, Anchor } from 'lucide-react'

export function HeroBanner() {
  const categories = [
    {
      name: 'Automobile',
      url: '/categorie/automobile',
      icon: Car,
      bgClass: 'bg-gradient-to-br from-blue-900 to-blue-700',
    },
    {
      name: 'Moto / Quad / Karting',
      url: '/categorie/moto-quad-karting',
      icon: Bike,
      bgClass: 'bg-gradient-to-br from-red-900 to-red-700',
    },
    {
      name: 'Transport / T.P.',
      url: '/categorie/transport-tp',
      icon: Truck,
      bgClass: 'bg-gradient-to-br from-orange-900 to-orange-700',
    },
    {
      name: 'Agriculture / Motoculture',
      url: '/categorie/agriculture-motoculture',
      icon: Tractor,
      bgClass: 'bg-gradient-to-br from-green-900 to-green-700',
    },
    {
      name: 'Industrie et spécialités',
      url: '/categorie/industrie-specialites',
      icon: Factory,
      bgClass: 'bg-gradient-to-br from-purple-900 to-purple-700',
    },
    {
      name: 'Marine nautisme',
      url: '/categorie/marine-nautisme',
      icon: Anchor,
      bgClass: 'bg-gradient-to-br from-cyan-900 to-cyan-700',
    },
  ]

  const MainIcon = categories[0]!.icon

  return (
    <section className="bg-brand-surface pt-8 pb-32">
      <div className="section-padding">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Main Hero (Automobile) takes 2 columns on lg */}
          <Link
            href={categories[0]!.url}
            className={`group relative h-80 overflow-hidden rounded-2xl lg:col-span-2 ${categories[0]!.bgClass}`}
          >
            <div className="absolute inset-0 bg-black/20 transition-opacity group-hover:opacity-100 opacity-50"></div>
            {/* Background Icon */}
            <MainIcon size={240} className="absolute -bottom-10 -right-10 text-white opacity-10 transition-transform duration-500 group-hover:scale-110" />
            
            <div className="absolute bottom-0 left-0 w-full p-8">
              <span className="bg-brand-accent mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wider text-black uppercase">
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
          {categories.slice(1).map((cat) => {
            const Icon = cat.icon
            return (
              <Link
                key={cat.name}
                href={cat.url}
                className={`group relative h-80 overflow-hidden rounded-2xl ${cat.bgClass}`}
              >
                <div className="absolute inset-0 bg-black/20 transition-opacity group-hover:opacity-100 opacity-50"></div>
                {/* Background Icon */}
                <Icon size={160} className="absolute -bottom-6 -right-6 text-white opacity-10 transition-transform duration-500 group-hover:scale-110" />

                <div className="absolute bottom-0 left-0 w-full p-6">
                  <h3 className="font-display group-hover:text-brand-accent mb-2 text-xl leading-tight font-bold text-white transition-colors">
                    {cat.name}
                  </h3>
                  <div className="text-brand-accent inline-flex items-center gap-2 text-sm font-medium transition-all group-hover:gap-3">
                    Voir la gamme <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
