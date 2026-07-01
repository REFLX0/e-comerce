import { Link } from '@/i18n/routing'
import { ArrowRight, Car, Bike, Truck, Tractor, Factory, Anchor } from 'lucide-react'

const categories = [
  {
    name: 'Automobile',
    url: '/categorie/automobile',
    icon: Car,
    gradient: 'from-[#0a1628] via-[#0d2044] to-[#1a3060]',
    accentColor: 'rgba(59,130,246,0.4)',
    tag: '⭐ Top Vente',
  },
  {
    name: 'Moto / Quad',
    url: '/categorie/moto-quad-karting',
    icon: Bike,
    gradient: 'from-[#1a0a0a] via-[#3d0f0f] to-[#5c1515]',
    accentColor: 'rgba(239,68,68,0.35)',
    tag: null,
  },
  {
    name: 'Transport / T.P.',
    url: '/categorie/transport-tp',
    icon: Truck,
    gradient: 'from-[#1a0f00] via-[#3d2000] to-[#5c3300]',
    accentColor: 'rgba(249,115,22,0.35)',
    tag: null,
  },
  {
    name: 'Agriculture',
    url: '/categorie/agriculture-motoculture',
    icon: Tractor,
    gradient: 'from-[#051a08] via-[#0d3d14] to-[#15601e]',
    accentColor: 'rgba(34,197,94,0.30)',
    tag: null,
  },
  {
    name: 'Industrie',
    url: '/categorie/industrie-specialites',
    icon: Factory,
    gradient: 'from-[#100a1a] via-[#2a1240] to-[#3d1a5c]',
    accentColor: 'rgba(168,85,247,0.35)',
    tag: null,
  },
  {
    name: 'Marine',
    url: '/categorie/marine-nautisme',
    icon: Anchor,
    gradient: 'from-[#001a1a] via-[#003d3d] to-[#005c5c]',
    accentColor: 'rgba(6,182,212,0.35)',
    tag: null,
  },
]

export function HeroBanner() {
  const MainIcon = categories[0]!.icon

  return (
    <section className="relative bg-brand-primary-dark pt-8 pb-32 overflow-hidden">
      {/* Animated background texture */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% -20%, rgba(245,197,24,0.07) 0%, transparent 60%)',
        }}
      />

      <div className="section-padding relative">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

          {/* ── Main Hero Card (Automobile) — 2 columns on lg ─────────── */}
          <Link
            href={categories[0]!.url}
            className={`group relative h-80 overflow-hidden rounded-2xl lg:col-span-2 bg-gradient-to-br ${categories[0]!.gradient}`}
            style={{ boxShadow: `0 24px 60px ${categories[0]!.accentColor}` }}
          >
            {/* Ambient glow */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{ background: `radial-gradient(circle at 70% 60%, ${categories[0]!.accentColor} 0%, transparent 65%)` }}
            />
            {/* Background icon */}
            <MainIcon
              size={280}
              className="absolute -bottom-12 -right-12 text-white opacity-[0.07] transition-transform duration-700 group-hover:scale-105 group-hover:opacity-[0.10]"
            />
            {/* Mesh overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <div className="absolute bottom-0 left-0 w-full p-8">
              {categories[0]!.tag && (
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-accent px-3 py-1 text-xs font-bold tracking-wider text-brand-primary uppercase">
                  {categories[0]!.tag}
                </span>
              )}
              <h2 className="font-display mb-2 text-4xl font-black text-white transition-colors duration-300 group-hover:text-brand-accent md:text-5xl">
                {categories[0]!.name}
              </h2>
              <p className="mb-5 hidden max-w-md text-sm leading-relaxed text-white/60 sm:block">
                Huiles moteur, boîte de vitesses et liquides de refroidissement pour votre véhicule.
              </p>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 group-hover:bg-brand-accent group-hover:text-brand-primary group-hover:gap-3">
                Découvrir la gamme <ArrowRight size={16} />
              </div>
            </div>
          </Link>

          {/* ── Secondary Cards ───────────────────────────────────────── */}
          {categories.slice(1).map((cat) => {
            const Icon = cat.icon
            return (
              <Link
                key={cat.name}
                href={cat.url}
                className={`group relative h-80 overflow-hidden rounded-2xl bg-gradient-to-br ${cat.gradient}`}
                style={{ boxShadow: `0 16px 40px ${cat.accentColor}` }}
              >
                {/* Ambient glow on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at 60% 60%, ${cat.accentColor} 0%, transparent 65%)` }}
                />
                {/* Background icon */}
                <Icon
                  size={170}
                  className="absolute -bottom-6 -right-6 text-white opacity-[0.08] transition-transform duration-500 group-hover:scale-110 group-hover:opacity-[0.12]"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                <div className="absolute bottom-0 left-0 w-full p-6">
                  <h3 className="font-display mb-2 text-xl font-bold text-white transition-colors duration-300 group-hover:text-brand-accent leading-tight">
                    {cat.name}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 text-sm font-medium text-white/60 transition-all duration-300 group-hover:text-brand-accent group-hover:gap-2.5">
                    Voir la gamme <ArrowRight size={15} />
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
