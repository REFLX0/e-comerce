"use client"

import { ArrowDown, ShieldCheck, Package, Truck, Award } from 'lucide-react'

export function HeroBanner() {
  const heroBadges = [
    { icon: Award, label: 'Distributeur Officiel' },
    { icon: Package, label: '5000+ Produits' },
    { icon: Truck, label: 'Livraison 24h' },
    { icon: ShieldCheck, label: 'Livraison Gratuite' },
  ]

  const scrollToFinder = () => {
    document.getElementById('oil-finder')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden bg-brand-primary-dark pt-24 pb-32 text-center">
      {/* Premium Cinematic Background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 20%, rgba(245,197,24,0.15) 0%, transparent 70%)',
        }}
      />
      
      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 bg-[url('/img/noise.png')] opacity-20 mix-blend-overlay" />

      <div className="section-padding relative z-10 mx-auto max-w-4xl flex flex-col items-center">
        
        {/* Subtle top badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-accent backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-accent opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-accent"></span>
          </span>
          La Qualité Automobile
        </div>

        {/* Huge Hero Title */}
        <h1 className="font-display mb-6 text-5xl font-black leading-[1.1] text-white md:text-6xl lg:text-7xl">
          Trouvez l&apos;huile parfaite <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-yellow-600">
            pour votre véhicule
          </span>
        </h1>

        <p className="mb-10 max-w-2xl text-lg text-white/60 md:text-xl">
          Expertise, performance et longévité. Découvrez notre sélection premium de lubrifiants et pièces avec recommandation sur mesure.
        </p>

        {/* Primary CTA */}
        <button
          onClick={scrollToFinder}
          className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-brand-accent px-8 py-4 font-bold text-black transition-all hover:scale-105 hover:bg-yellow-400 active:scale-95 shadow-[0_0_40px_rgba(245,197,24,0.3)]"
        >
          <span className="relative z-10 flex items-center gap-2 text-lg">
            Trouver mon huile <ArrowDown size={20} className="transition-transform group-hover:translate-y-1" />
          </span>
        </button>

        {/* 4 Trust Badges in Hero */}
        <div className="mt-20 grid w-full grid-cols-2 gap-4 md:grid-cols-4 border-t border-white/10 pt-10">
          {heroBadges.map((badge, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center gap-3 text-white/70 transition-colors hover:text-white">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                <badge.icon size={22} className="text-brand-accent" />
              </div>
              <span className="text-sm font-medium">{badge.label}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
